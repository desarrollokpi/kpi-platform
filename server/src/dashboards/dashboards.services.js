const dashboardsRepository = require("./dashboards.repository");
const instanceRepository = require("../instances/instances.repository");
const reportsRepository = require("../reports/reports.repository");
const permissionsService = require("../common/permissions.service");
const { ValidationError, NotFoundError, ForbiddenError } = require("../common/exception");
const { createApacheSuperSetClient } = require("../integrations/apache-superset.service");

exports.createDashboard = async (dashboardData) => {
  const { name, reportId, apacheId } = dashboardData;

  // Validate required fields
  if (!reportId || !name || !apacheId) {
    throw new ValidationError("reportId, name, and apacheId are required");
  }

  // Validate report exists and is active
  const report = await reportsRepository.findById(reportId);
  if (!report) {
    throw new NotFoundError("Report not found");
  }

  const [instanceIdPart, apacheDashboardIdPart] = apacheId.split("-");
  const instanceId = parseInt(instanceIdPart, 10);
  const supersetDashboardId = parseInt(apacheDashboardIdPart, 10);

  if (Number.isNaN(instanceId) || Number.isNaN(supersetDashboardId)) {
    throw new ValidationError("apacheId must be in the format '<instanceId>-<dashboardId>'");
  }

  const instance = await instanceRepository.findById(instanceId);
  if (!instance) {
    throw new ValidationError(`This instances doenst exists`);
  }

  const client = createApacheSuperSetClient(instance);
  const { uuid } = await client.enableEmbeddedDashboard(supersetDashboardId);

  if (uuid) {
    // Create dashboard

    const result = await dashboardsRepository.createDashboard({
      instanceId,
      supersetDashboardId,
      embeddedId: uuid,
      name,
      reportId,
      active: true,
    });

    return await dashboardsRepository.findById(result.insertId || result[0]?.insertId);
  }

  throw new Error("Problem with Apache getting embedded id");
};

exports.updateDashboard = async (id, updateData, userId) => {
  const dashboard = await dashboardsRepository.findById(id);
  if (!dashboard) {
    throw new NotFoundError("Dashboard not found");
  }

  // Don't allow changing instanceId if it conflicts with another dashboard
  if (updateData.instanceId && updateData.instanceId !== dashboard.instanceId) {
    const existing = await dashboardsRepository.findBySupersetId(updateData.instanceId);
    if (existing && existing.id !== id) {
      throw new ValidationError(`Dashboard with instanceId ${updateData.instanceId} already exists`);
    }
  }

  // Validate reportId if provided
  if (updateData.reportId) {
    const report = await reportsRepository.findById(updateData.reportId);
    if (!report) {
      throw new NotFoundError("Report not found");
    }
  }

  await dashboardsRepository.updateDashboard(id, updateData);
  return await dashboardsRepository.findById(id);
};

exports.getDashboardById = async (id, userId) => {
  const dashboard = await dashboardsRepository.findById(id);
  if (!dashboard) {
    throw new NotFoundError("Dashboard not found");
  }

  // Validate user has access to this dashboard
  const hasAccess = await permissionsService.validateUserDashboardAccess(userId, id);
  if (!hasAccess) {
    throw new ForbiddenError("You do not have access to this dashboard");
  }

  return dashboard;
};

exports.getAllDashboards = async (options = {}, userId) => {
  const { accountId } = options;

  // If accountId is provided, always filter dashboards by that tenant (used by tenant admins views)
  if (accountId !== undefined) {
    return await dashboardsRepository.findAllByAccount(accountId, options);
  }

  const isRootAdmin = await permissionsService.isRootAdmin(userId);

  if (isRootAdmin) {
    // Root Admin without account filter: global dashboards using permissions service metadata
    const dashboardRows = await permissionsService.getUserAccessibleDashboards(userId);

    // Apply optional filters
    let filtered = dashboardRows;

    if (options.reportId) {
      const reportFilter = parseInt(options.reportId, 10);
      filtered = filtered.filter((d) => d.reportsId === reportFilter || d.reportId === reportFilter);
    }

    if (options.active !== undefined) {
      const activeValue = options.active === true || options.active === "true";
      filtered = filtered.filter((d) => d.active === activeValue);
    }

    // Apply pagination
    if (options.offset !== undefined) {
      filtered = filtered.slice(parseInt(options.offset, 10));
    }

    if (options.limit !== undefined) {
      filtered = filtered.slice(0, parseInt(options.limit, 10));
    }

    return filtered;
  }

  // For Tenant Admins and Users without explicit account filter: Use permissions service (Regla de oro)
  const accessibleDashboards = await permissionsService.getUserAccessibleDashboards(userId);

  // Apply additional filters if provided
  let filtered = accessibleDashboards;

  if (options.reportId) {
    const reportFilter = parseInt(options.reportId, 10);
    filtered = filtered.filter((d) => d.reportId === reportFilter);
  }

  if (options.active !== undefined) {
    const activeValue = options.active === true || options.active === "true";
    filtered = filtered.filter((d) => d.active === activeValue);
  }

  // Apply pagination
  if (options.offset !== undefined) {
    filtered = filtered.slice(parseInt(options.offset, 10));
  }

  if (options.limit !== undefined) {
    filtered = filtered.slice(0, parseInt(options.limit, 10));
  }

  return filtered;
};

exports.getDashboardsForSelect = async () => {
  try {
    return await dashboardsRepository.getForSelect();
  } catch (error) {
    return [];
  }
};

exports.getDashboardsInstancesForSelect = async ({ reportId }) => {
  if (!reportId) {
    throw new ValidationError("reportId is required");
  }

  const report = await reportsRepository.findById(reportId);
  if (!report) {
    throw new NotFoundError("Report not found");
  }

  const workspaceId = report.workspaceId;

  const rows = await dashboardsRepository.findInstancesForWorkspace(workspaceId);

  // Deduplicate instances by id
  const instancesById = new Map();
  rows.forEach((row) => {
    if (!instancesById.has(row.instanceId)) {
      instancesById.set(row.instanceId, row);
    }
  });

  const options = [];
  let anySuccess = false;

  for (const row of instancesById.values()) {
    try {
      const client = createApacheSuperSetClient({
        baseUrl: row.baseUrl,
        apiUserName: row.apiUserName,
        apiPassword: row.apiPassword,
      });

      const dashboardsResponse = await client.listDashboards();
      const supersetDashboards = Array.isArray(dashboardsResponse?.result)
        ? dashboardsResponse.result
        : Array.isArray(dashboardsResponse)
        ? dashboardsResponse
        : [];

      supersetDashboards.forEach((d) => {
        const supersetDashboardId = d.id;
        const dashboardTitle = d.dashboard_title || d.dashboardTitle || d.slug || `Dashboard ${supersetDashboardId}`;

        options.push({
          value: `${row.instanceId}-${supersetDashboardId}`,
          label: `${row.instanceName} - ${dashboardTitle}`,
        });
      });

      if (supersetDashboards.length > 0) {
        anySuccess = true;
      }
    } catch (error) {
      // If one instance fails, log and continue with others
      console.error("Error listing dashboards for instance", row.instanceId, error.message);
    }
  }

  if (!anySuccess) {
    throw new ValidationError(
      "No fue posible conectarse a ninguna instancia de Superset para este workspace. " +
        "Por favor revisa la URL de la instancia, el usuario y la contraseña configurados."
    );
  }

  return options;
};

exports.getDashboardCount = async (options = {}, userId) => {
  // For total count we must ignore pagination params and keep only filters
  const { limit, offset, ...filterOptions } = options;
  const dashboards = await exports.getAllDashboards(filterOptions, userId);
  return dashboards.length;
};

exports.softDeleteDashboard = async (id, userId) => {
  const dashboard = await dashboardsRepository.findById(id);
  if (!dashboard) {
    throw new NotFoundError("Dashboard not found");
  }

  await dashboardsRepository.softDelete(id);
};

exports.activateDashboard = async (id) => {
  const dashboard = await dashboardsRepository.findById(id);
  if (!dashboard) {
    throw new NotFoundError("Dashboard not found");
  }

  await dashboardsRepository.activate(id);

  return await dashboardsRepository.findById(id);
};

exports.deactivateDashboard = async (id) => {
  const dashboard = await dashboardsRepository.findById(id);
  if (!dashboard) {
    throw new NotFoundError("Dashboard not found");
  }

  await dashboardsRepository.deactivate(id);

  return await dashboardsRepository.findById(id);
};

exports.assignDashboardToUser = async (dashboardId, targetUserId, adminUserId) => {
  // Validate dashboard exists
  const dashboard = await dashboardsRepository.findById(dashboardId);
  if (!dashboard) {
    throw new NotFoundError("Dashboard not found");
  }

  // Root Admin can assign any dashboard to any user
  const isRootAdmin = await permissionsService.isRootAdmin(adminUserId);

  if (!isRootAdmin) {
    // Tenant Admin: validate permissions
    const canAssign = await permissionsService.canAssignDashboard(adminUserId, targetUserId, dashboardId);
    if (!canAssign) {
      throw new ForbiddenError(
        "You cannot assign this dashboard to this user. Ensure the user is in your tenant and the dashboard is in an enabled workspace."
      );
    }
  }

  // Check if assignment already exists
  const hasAccess = await dashboardsRepository.userHasAccess(targetUserId, dashboardId);
  if (hasAccess) {
    throw new ValidationError("User already has access to this dashboard");
  }

  // Create assignment
  await dashboardsRepository.assignDashboardToUser(targetUserId, dashboardId);

  return { success: true, message: "Dashboard assigned successfully" };
};

exports.removeDashboardFromUser = async (dashboardId, targetUserId, adminUserId) => {
  // Validate dashboard exists
  const dashboard = await dashboardsRepository.findById(dashboardId);
  if (!dashboard) {
    throw new NotFoundError("Dashboard not found");
  }

  // Root Admin can remove any assignment
  const isRootAdmin = await permissionsService.isRootAdmin(adminUserId);

  if (!isRootAdmin) {
    // Tenant Admin: validate same tenant
    const canAssign = await permissionsService.canAssignDashboard(adminUserId, targetUserId, dashboardId);
    if (!canAssign) {
      throw new ForbiddenError("You cannot manage dashboard assignments for this user");
    }
  }

  // Check if assignment exists
  const hasAccess = await dashboardsRepository.userHasAccess(targetUserId, dashboardId);
  if (!hasAccess) {
    throw new ValidationError("User does not have access to this dashboard");
  }

  // Remove assignment (soft delete)
  await dashboardsRepository.removeDashboardFromUser(targetUserId, dashboardId);

  return { success: true, message: "Dashboard assignment removed successfully" };
};

exports.getUserDashboards = async (userId) => {
  return await permissionsService.getUserAccessibleDashboards(userId);
};

exports.getDashboardUsers = async (dashboardId, requestingUserId) => {
  const dashboard = await dashboardsRepository.findById(dashboardId);
  if (!dashboard) {
    throw new NotFoundError("Dashboard not found");
  }

  // Only Root Admin or Tenant Admin of the dashboard's tenant can see assigned users
  const isRootAdmin = await permissionsService.isRootAdmin(requestingUserId);
  if (!isRootAdmin) {
    const isTenantAdmin = await permissionsService.isTenantAdmin(requestingUserId);
    if (!isTenantAdmin) {
      throw new ForbiddenError("Only admins can view dashboard assignments");
    }

    // Validate tenant admin has access to this dashboard
    const hasAccess = await permissionsService.validateUserDashboardAccess(requestingUserId, dashboardId);
    if (!hasAccess) {
      throw new ForbiddenError("You do not have access to this dashboard");
    }
  }

  const [users] = await dashboardsRepository.findUsersForDashboard(dashboardId);
  return users || [];
};

exports.getDashboardEmbedInfo = async (dashboardId, userId) => {
  const hasAccess = await permissionsService.validateUserDashboardAccess(userId, dashboardId);
  if (!hasAccess) {
    throw new ForbiddenError("You do not have access to this dashboard");
  }

  const info = await dashboardsRepository.getDashboardEmbedInfo(dashboardId);

  if (!info) {
    throw new NotFoundError("Dashboard not found or not accessible");
  }

  return info;
};

exports.bulkAssignDashboardsToUser = async (targetUserId, dashboardIds, adminUserId) => {
  if (!Array.isArray(dashboardIds)) {
    throw new ValidationError("dashboardIds must be an array");
  }

  const uniqueDashboardIds = [...new Set(dashboardIds.map((id) => parseInt(id)))].filter((id) => !Number.isNaN(id));

  // Get current direct assignments for the user
  const currentRows = await dashboardsRepository.findActiveAssignmentsForUser(targetUserId);

  const currentIds = new Set(currentRows.map((row) => row.dashboardId));
  const desiredIds = new Set(uniqueDashboardIds);

  const toAdd = [...desiredIds].filter((id) => !currentIds.has(id));
  const toRemove = [...currentIds].filter((id) => !desiredIds.has(id));

  // Add new assignments
  for (const dashboardId of toAdd) {
    await exports.assignDashboardToUser(dashboardId, targetUserId, adminUserId);
  }

  // Remove assignments not in desired list
  for (const dashboardId of toRemove) {
    await exports.removeDashboardFromUser(dashboardId, targetUserId, adminUserId);
  }

  return {
    success: true,
    message: "Dashboards updated successfully",
  };
};

exports.getDashboardsAssignableToUser = async (targetUserId, adminUserId) => {
  const userRows = await dashboardsRepository.findActiveUserById(targetUserId);

  if (!userRows) {
    throw new NotFoundError("User not found");
  }

  const targetAccountId = userRows.accountId;

  const rows = await dashboardsRepository.findDashboardsAssignableToUser(targetAccountId);

  // Deduplicate dashboards by id in case a workspace is linked to multiple instances
  const byId = new Map();
  rows.forEach((row) => {
    if (!byId.has(row.id)) {
      byId.set(row.id, row);
    }
  });

  return Array.from(byId.values());
};
