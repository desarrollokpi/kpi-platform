const permissionsService = require("../common/permissions.service");
const dashboardsServices = require("./dashboards.services");
const { createSupersetClient } = require("../supersetInstances/supersetApi.service");
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
    // 3. Create Superset API client
    const supersetClient = createSupersetClient({
      baseUrl: dashboardInfo.baseUrl,
      apiUserName: dashboardInfo.apiUserName,
    });

    // 4. Get dashboard details from Superset
    const dashboard = await supersetClient.getDashboard(dashboardInfo.supersetId);

    // 5. Extract data from dashboard
    // Note: Superset API doesn't directly expose underlying data for dashboards
    // We need to query each chart/slice individually
    let allData = [];
    let headers = [];

    if (dashboard.slices && dashboard.slices.length > 0) {
      // For each chart in the dashboard, try to get its data
      for (const slice of dashboard.slices) {
        try {
          const chartData = await supersetClient.getChart(slice.id);

          // Extract data from chart metadata
          // This is a simplified approach - actual implementation may vary
          // based on Superset version and chart type
          if (chartData.params) {
            // Add chart name as section header
            allData.push({
              section: `Chart: ${slice.slice_name || slice.form_data?.slice_name || chartData.slice_name}`,
            });

            // TODO: Query actual data using Superset's chart data endpoint
            // This would require calling /api/v1/chart/{id}/data endpoint
            // For now, we include metadata
            allData.push({
              chartId: slice.id,
              chartName: slice.slice_name || "Unnamed Chart",
              datasource: chartData.datasource_name_text || "N/A",
              vizType: chartData.viz_type || "N/A",
            });
          }
        } catch (chartError) {
          console.error(`Error fetching chart ${slice.id}:`, chartError.message);
          // Continue with other charts
        }
      }
    } else {
      // No charts found, export dashboard metadata
      allData.push({
        dashboardId: dashboard.id,
        dashboardName: dashboard.dashboard_title,
        status: dashboard.status,
        published: dashboard.published,
        owners: dashboard.owners?.map((o) => o.username).join(", ") || "N/A",
      });
    }

    // 6. Convert to CSV
    let csvContent;
    if (allData.length > 0) {
      // Get all unique keys from data as headers
      const allKeys = new Set();
      allData.forEach((row) => {
        Object.keys(row).forEach((key) => allKeys.add(key));
      });
      headers = Array.from(allKeys);

      csvContent = stringify(allData, {
        header: true,
        columns: headers,
      });
    } else {
      // Empty data
      csvContent = "No data available for this dashboard\n";
    }

    // 7. Generate filename
    const timestamp = new Date().toISOString().split("T")[0];
    const safeName = (dashboardInfo.name || "dashboard").replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const filename = `dashboard_${safeName}_${timestamp}.csv`;

    return {
      csv: csvContent,
      filename,
      contentType: "text/csv",
    };
  } catch (error) {
    console.error("Error exporting dashboard data:", error);
    throw new Error(`Failed to export dashboard data: ${error.message}`);
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
    const supersetClient = createSupersetClient({
      baseUrl: dashboardInfo.baseUrl,
      apiUserName: dashboardInfo.apiUserName,
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
