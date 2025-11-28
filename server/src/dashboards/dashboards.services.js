const dashboardsRepository = require("./dashboards.repository");
const instanceRepository = require("../instances/instances.repository");
const reportsRepository = require("../reports/reports.repository");
const permissionsService = require("../common/permissions.service");
const { ValidationError, NotFoundError, ForbiddenError } = require("../common/exception");
const { createApacheSuperSetClient } = require("../apache-superset/apache-superset.service");
const { db } = require("../../database");
const { accountsInstances, accountsInstancesWorkspaces, instances } = require("../db/schema");
const { and, eq, isNull } = require("drizzle-orm");

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

  const [supersetId, apacheDashboardId] = apacheId.split("-");

  // Check if dashboard with same supersetId already exists
  const existing = await dashboardsRepository.findBySupersetId(supersetId);
  if (existing) {
    throw new ValidationError(`Dashboard with supersetId ${supersetId} already exists`);
  }

  const instance = await instanceRepository.findById(supersetId);
  if (!instance) {
    throw new ValidationError(`This instances doenst exists`);
  }

  const client = createApacheSuperSetClient(instance);
  const { uuid } = await client.enableEmbeddedDashboard(apacheDashboardId);

  if (uuid) {
    // Create dashboard

    const result = await dashboardsRepository.createDashboard({
      supersetId: supersetId,
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

  // Don't allow changing supersetId if it conflicts with another dashboard
  if (updateData.supersetId && updateData.supersetId !== dashboard.supersetId) {
    const existing = await dashboardsRepository.findBySupersetId(updateData.supersetId);
    if (existing && existing.id !== id) {
      throw new ValidationError(`Dashboard with supersetId ${updateData.supersetId} already exists`);
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
  const isRootAdmin = await permissionsService.isRootAdmin(userId);

  if (isRootAdmin) {
    // Root Admin: Get all dashboards
    return await dashboardsRepository.findAll(options);
  }

  // For Tenant Admins and Users: Use permissions service
  // This applies the "Regla de oro"
  const accessibleDashboards = await permissionsService.getUserAccessibleDashboards(userId);

  // Apply additional filters if provided
  let filtered = accessibleDashboards;

  if (options.reportId) {
    filtered = filtered.filter((d) => d.reportId === parseInt(options.reportId));
  }

  if (options.active !== undefined) {
    filtered = filtered.filter((d) => d.active === (options.active === true || options.active === "true"));
  }

  // Apply pagination
  if (options.offset !== undefined) {
    filtered = filtered.slice(parseInt(options.offset));
  }

  if (options.limit !== undefined) {
    filtered = filtered.slice(0, parseInt(options.limit));
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

  const workspaceId = report.workspacesId;

  const rows = await db
    .select({
      instanceId: instances.id,
      instanceName: instances.name,
      baseUrl: instances.baseUrl,
      apiUserName: instances.apiUserName,
      apiPassword: instances.apiPassword,
    })
    .from(accountsInstancesWorkspaces)
    .innerJoin(
      accountsInstances,
      and(
        eq(accountsInstancesWorkspaces.idAccountsInstances, accountsInstances.id),
        eq(accountsInstances.active, true),
        isNull(accountsInstances.deletedAt)
      )
    )
    .innerJoin(
      instances,
      and(eq(accountsInstances.instancesId, instances.id), eq(instances.active, true), isNull(instances.deletedAt))
    )
    .where(
      and(
        eq(accountsInstancesWorkspaces.idWorkspaces, workspaceId),
        eq(accountsInstancesWorkspaces.active, true),
        isNull(accountsInstancesWorkspaces.deletedAt)
      )
    );

  // Deduplicate instances by id
  const instancesById = new Map();
  rows.forEach((row) => {
    if (!instancesById.has(row.instanceId)) {
      instancesById.set(row.instanceId, row);
    }
  });

  const options = [];

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
    } catch (error) {
      // If one instance fails, log and continue with others
      console.error("Error listing dashboards for instance", row.instanceId, error.message);
    }
  }

  return options;
};

exports.getDashboardCount = async (options = {}, userId) => {
  const dashboards = await exports.getAllDashboards(options, userId);
  return dashboards.length;
};

exports.softDeleteDashboard = async (id, userId) => {
  const dashboard = await dashboardsRepository.findById(id);
  if (!dashboard) {
    throw new NotFoundError("Dashboard not found");
  }

  await dashboardsRepository.softDelete(id);
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
