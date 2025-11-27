const dashboardsRepository = require("./dashboards.repository");
const reportsRepository = require("../reports/reports.repository");
const permissionsService = require("../common/permissions.service");
const { ValidationError, NotFoundError, ForbiddenError } = require("../common/exception");

exports.createDashboard = async (dashboardData, userId) => {
  const { supersetId, embeddedId, name, reportsId } = dashboardData;

  // Validate required fields
  if (!supersetId || !name || !reportsId) {
    throw new ValidationError("supersetId, name, and reportsId are required");
  }

  // Validate report exists and is active
  const report = await reportsRepository.findById(reportsId);
  if (!report) {
    throw new NotFoundError("Report not found");
  }

  // Check if dashboard with same supersetId already exists
  const existing = await dashboardsRepository.findBySupersetId(supersetId);
  if (existing) {
    throw new ValidationError(`Dashboard with supersetId ${supersetId} already exists`);
  }

  // Create dashboard
  const result = await dashboardsRepository.createDashboard({
    supersetId,
    embeddedId: embeddedId || null,
    name,
    reportsId,
    active: true,
  });

  return await dashboardsRepository.findById(result.insertId || result[0]?.insertId);
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

  // Validate reportsId if provided
  if (updateData.reportsId) {
    const report = await reportsRepository.findById(updateData.reportsId);
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

  if (options.reportsId) {
    filtered = filtered.filter((d) => d.reportsId === parseInt(options.reportsId));
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
  // Validate access using permissions service
  const hasAccess = await permissionsService.validateUserDashboardAccess(userId, dashboardId);
  if (!hasAccess) {
    throw new ForbiddenError("You do not have access to this dashboard");
  }

  // Get dashboard with full chain information
  const { db } = require("../../database");
  const { sql } = require("drizzle-orm");

  const [rows] = await db.execute(sql`
    SELECT
      d.id,
      d.superset_id as supersetId,
      d.embedded_id as embeddedId,
      d.name,
      d.reports_id as reportsId,
      r.name as reportName,
      r.workspaces_id as workspacesId,
      w.name as workspaceName,
      i.id as intanceId,
      i.name as intanceName,
      i.base_url as baseUrl,
      i.api_user_name as apiUserName,
      d.active,
      d.created_at as createdAt,
      d.updated_at as updatedAt
    FROM dashboards d
    INNER JOIN reports r ON r.id = d.reports_id
    INNER JOIN workspaces w ON w.id = r.workspaces_id
    INNER JOIN accounts_instances_workspaces aiw ON aiw.id_workspaces = w.id
      AND aiw.active = 1 AND aiw.deleted_at IS NULL
    INNER JOIN accounts_instances ai ON ai.id = aiw.id_accounts_instances
      AND ai.active = 1 AND ai.deleted_at IS NULL
    INNER JOIN instances i ON i.id = ai.instances_id
      AND i.active = 1 AND i.deleted_at IS NULL
    INNER JOIN users u ON u.accounts_id = ai.accounts_id
      AND u.active = 1 AND u.deleted_at IS NULL
    WHERE d.id = ${dashboardId}
      AND u.id = ${userId}
      AND d.active = 1 AND d.deleted_at IS NULL
    LIMIT 1
  `);

  if (!rows || rows.length === 0) {
    throw new NotFoundError("Dashboard not found or not accessible");
  }

  return rows[0];
};
