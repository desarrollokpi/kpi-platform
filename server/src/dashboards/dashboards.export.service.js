const permissionsService = require("../common/permissions.service");
const dashboardsServices = require("./dashboards.services");
const { createApacheSuperSetClient } = require("../apache-superset/apache-superset.service");
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

  console.log("dashboardInfo", dashboardInfo);

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

    let allData = [];

    console.log("dashboard", dashboard);

    const dashboardTitle = dashboard?.dashboard_title || dashboardInfo.name || "dashboard";

    if (dashboard && dashboard.position_json) {
      let jsonPosition;
      try {
        jsonPosition = JSON.parse(dashboard.position_json);
      } catch (parseError) {
        console.error("Error parsing dashboard position_json:", parseError.message);
      }

      if (jsonPosition && typeof jsonPosition === "object") {
        const charts = [];

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
            console.log("chartData", chartData);

            const chartName = chartNameFromMeta || chartData.slice_name || `Chart ${chartId}`;
            let queryText = chartData.query_context || chartData.params || "";

            charts.push({
              name: chartName,
              query: queryText,
            });
          } catch (chartError) {
            console.log("chartError", chartError);
            console.error(`Error fetching chart ${chartId}:`, chartError.message);
          }
        }

        if (charts.length > 0) {
          const row = {};
          charts.forEach((chart) => {
            row[chart.name] = chart.query;
          });
          allData.push(row);
        }
      }
    }

    let csvContent;
    if (allData.length > 0) {
      csvContent = stringify(allData, {
        header: true,
      });
    } else {
      csvContent = "No data available for this dashboard\n";
    }

    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `${dashboardTitle}_${timestamp}.csv`;

    return {
      csv: csvContent,
      filename,
      contentType: "text/csv",
    };
  } catch (error) {
    console.error("Error exporting dashboard data:", error);

    const timestamp = new Date().toISOString().split("T")[0];
    const safeName = (dashboardId || "dashboard")
      .toString()
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    const filename = `dashboard_${safeName}_${timestamp}.csv`;

    return {
      csv: "No data available for this dashboard\n",
      filename,
      contentType: "text/csv",
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
    const dashboard = await supersetClient.getDashboard(dashboardInfo.supersetId);

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
