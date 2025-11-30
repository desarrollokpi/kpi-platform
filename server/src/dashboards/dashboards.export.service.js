const permissionsService = require("../common/permissions.service");
const dashboardsServices = require("./dashboards.services");
const { createApacheSuperSetClient } = require("../integrations/apache-superset.service");
const { ForbiddenError, NotFoundError } = require("../common/exception");
const { stringify } = require("csv-stringify/sync");

exports.exportDashboardDataToCsv = async (dashboardId, userId) => {
  // 1. Validate access using permissions service (Regla de oro)
  const hasAccess = await permissionsService.validateUserDashboardAccess(userId, dashboardId);
  if (!hasAccess) {
    throw new ForbiddenError("You do not have access to this dashboard");
  }

  // 2. Get dashboard with embed info (includes Superset instance)
  const dashboardInfo = await dashboardsServices.getDashboardEmbedInfo(dashboardId, userId);
  if (!dashboardInfo) {
    throw new NotFoundError("Dashboard not found or not accessible");
  }

  try {
    const supersetClient = createApacheSuperSetClient({
      baseUrl: dashboardInfo.baseUrl,
      apiUserName: dashboardInfo.apiUserName,
      apiPassword: dashboardInfo.apiPassword,
    });

    let dashboard = null;
    try {
      let supersetDashboardId = null;

      if (dashboardInfo.embeddedId) {
        try {
          const embeddedConfig = await supersetClient.getEmbeddedDashboardByUuid(dashboardInfo.embeddedId);
          supersetDashboardId = embeddedConfig && embeddedConfig.dashboard_id ? embeddedConfig.dashboard_id : null;
        } catch (embeddedError) {
          console.error("Error fetching embedded dashboard config for CSV:", embeddedError.message);
        }
      }

      console.log("supersetDashboardId", supersetDashboardId);

      if (supersetDashboardId) {
        dashboard = await supersetClient.getDashboard(supersetDashboardId);
      } else {
        console.warn("Unable to resolve Superset dashboard id from embedded configuration for CSV export.");
      }
    } catch (dashboardError) {
      console.error("Error fetching dashboard from Superset for CSV:", dashboardError.message);
    }

    const dashboardTitle = dashboard?.dashboard_title || dashboardInfo.name || "dashboard";

    const files = [];

    if (dashboard && dashboard.position_json) {
      let jsonPosition;
      try {
        jsonPosition = JSON.parse(dashboard.position_json);
      } catch (parseError) {
        console.error("Error parsing dashboard position_json:", parseError.message);
      }

      if (jsonPosition && typeof jsonPosition === "object") {
        const datasetsMap = new Map();

        for (const [key, value] of Object.entries(jsonPosition)) {
          if (!value || typeof value !== "object") continue;

          const meta = value.meta || {};

          const hasChartInKey = typeof key === "string" && key.toUpperCase().includes("CHART");
          const isChartType = value.type === "CHART";
          const chartId = meta.chartId;
          const chartNameFromMeta = meta.sliceName;

          if (!chartId || !(hasChartInKey || isChartType)) continue;

          try {
            const chartData = await supersetClient.getChart(chartId);
            const chartName = chartNameFromMeta || chartData.slice_name || `Chart ${chartId}`;

            const rawQueryContext = chartData.query_context || chartData.queryContext || chartData.query_context_json;
            if (!rawQueryContext) {
              continue;
            }

            let queryContext;
            try {
              queryContext = typeof rawQueryContext === "string" ? JSON.parse(rawQueryContext) : rawQueryContext;
            } catch (parseQcError) {
              console.error(`Error parsing query_context for chart ${chartId}:`, parseQcError.message);
              continue;
            }

            const datasource = queryContext.datasource || queryContext.form_data?.datasource;
            let datasetId = null;

            if (datasource && typeof datasource === "object" && typeof datasource.id === "number") {
              datasetId = datasource.id;
            } else if (typeof datasource === "string") {
              // Typical format: "<datasetId>__<type>"
              const idPart = datasource.split("__")[0];
              const parsedId = parseInt(idPart, 10);
              datasetId = Number.isNaN(parsedId) ? null : parsedId;
            }

            if (!datasetId) {
              continue;
            }

            if (!datasetsMap.has(datasetId)) {
              datasetsMap.set(datasetId, {
                datasetId,
                charts: [],
              });
            }

            const group = datasetsMap.get(datasetId);
            group.charts.push({
              chartId,
              chartName,
              queryContext,
            });
          } catch (chartError) {
            console.error(`Error fetching chart ${chartId}:`, chartError.message);
          }
        }

        // For each dataset, execute one query (first chart of that dataset) and export its data
        for (const [datasetId, group] of datasetsMap.entries()) {
          if (!group.charts.length) continue;

          const representative = group.charts[0];

          try {
            const dataResponse = await supersetClient.getChartData(representative.queryContext);
            const result = Array.isArray(dataResponse?.result) ? dataResponse.result[0] : null;
            const rows = Array.isArray(result?.data) ? result.data : [];

            let csvContent;
            if (rows.length > 0) {
              csvContent = stringify(rows, {
                header: true,
              });
            } else {
              csvContent = "No data available for this dataset\n";
            }

            const timestamp = new Date().toISOString().split("T")[0];
            const safeDashboardTitle = dashboardTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase();
            const filename = `${safeDashboardTitle}_dataset_${datasetId}_${timestamp}.csv`;

            files.push({
              datasetId,
              filename,
              contentType: "text/csv",
              csv: csvContent,
            });
          } catch (dataError) {
            console.error(`Error fetching data for dataset ${datasetId}:`, dataError.message);
          }
        }
      }
    }

    if (!files.length) {
      const timestamp = new Date().toISOString().split("T")[0];
      const safeDashboardTitle = dashboardTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      const fallbackFilename = `${safeDashboardTitle}_dataset_empty_${timestamp}.csv`;

      files.push({
        datasetId: null,
        filename: fallbackFilename,
        contentType: "text/csv",
        csv: "No data available for this dashboard\n",
      });
    }

    return { files };
  } catch (error) {
    console.error("Error exporting dashboard data:", error);

    const timestamp = new Date().toISOString().split("T")[0];
    const safeName = (dashboardId || "dashboard")
      .toString()
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    const filename = `dashboard_${safeName}_${timestamp}.csv`;

    return {
      files: [
        {
          datasetId: null,
          filename,
          contentType: "text/csv",
          csv: "No data available for this dashboard\n",
        },
      ],
    };
  }
};

exports.exportDashboardDataViaQuery = async (dashboardId, userId) => {
  // Validate access
  const hasAccess = await permissionsService.validateUserDashboardAccess(userId, dashboardId);
  if (!hasAccess) {
    throw new ForbiddenError("You do not have access to this dashboard");
  }

  // Get dashboard info
  const dashboardInfo = await dashboardsServices.getDashboardEmbedInfo(dashboardId, userId);
  if (!dashboardInfo) {
    throw new NotFoundError("Dashboard not found or not accessible");
  }

  try {
    // Create Superset client
    const supersetClient = createApacheSuperSetClient({
      baseUrl: dashboardInfo.baseUrl,
      apiUserName: dashboardInfo.apiUserName,
      apiPassword: dashboardInfo.apiPassword,
    });

    // Get dashboard to find database connections
    const dashboard = await supersetClient.getDashboard(dashboardInfo.instanceId);

    // Get list of databases from Superset
    const databases = await supersetClient.listDatabases();

    // TODO: Implement query execution logic
    // This would involve:
    // 1. Identifying the primary database for this dashboard
    // 2. Constructing appropriate SQL query
    // 3. Executing via Superset's SQL Lab API
    // 4. Converting results to CSV

    // For now, return placeholder
    const timestamp = new Date().toISOString().split("T")[0];
    const safeName = (dashboardInfo.name || "dashboard").replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const filename = `dashboard_${safeName}_${timestamp}.csv`;

    return {
      csv: "Dashboard data export via query not yet implemented\n",
      filename,
      contentType: "text/csv",
    };
  } catch (error) {
    console.error("Error exporting via query:", error);
    throw new Error(`Failed to export dashboard data: ${error.message}`);
  }
};

module.exports = exports;
