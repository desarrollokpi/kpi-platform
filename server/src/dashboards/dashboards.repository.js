const { db } = require("../../database");
const { eq, and, isNull, sql, desc } = require("drizzle-orm");
const { dashboards, usersDashboards, reports, workspaces, instances, users, accountsInstances, accountsInstancesWorkspaces } = require("../db/schema");
const { handleDbError } = require("../common/dbErrorMapper");

exports.createDashboard = async (dashboardData) => {
  try {
    const [result] = await db.insert(dashboards).values(dashboardData);
    return result;
  } catch (error) {
    handleDbError(error, "Failed to create dashboard");
  }
};

exports.findById = async (id) => {
  const result = await db
    .select()
    .from(dashboards)
    .where(and(eq(dashboards.id, id), isNull(dashboards.deletedAt)))
    .limit(1);
  return result[0] || null;
};

exports.findBySupersetId = async (instanceId) => {
  const result = await db
    .select()
    .from(dashboards)
    .where(and(eq(dashboards.instanceId, instanceId), isNull(dashboards.deletedAt)))
    .limit(1);
  return result[0] || null;
};

exports.findByReportId = async (reportId) => {
  return await db
    .select()
    .from(dashboards)
    .where(and(eq(dashboards.reportId, reportId), eq(dashboards.active, true), isNull(dashboards.deletedAt)));
};

exports.findAll = async (options = {}) => {
  const { active, limit, offset, reportId } = options;

  let conditions = [isNull(dashboards.deletedAt)];

  if (active !== undefined) {
    conditions.push(eq(dashboards.active, active));
  }

  if (reportId !== undefined) {
    conditions.push(eq(dashboards.reportId, reportId));
  }

  let query = db
    .select()
    .from(dashboards)
    .where(and(...conditions))
    .orderBy(desc(dashboards.createdAt));

  if (limit) {
    query = query.limit(limit);
  }

  if (offset) {
    query = query.offset(offset);
  }

  return await query;
};

exports.getForSelect = async () => {
  return await db
    .select({ label: dashboards.name, value: dashboards.id })
    .from(dashboards)
    .where(and(eq(dashboards.active, true), isNull(dashboards.deletedAt)));
};

exports.updateDashboard = async (id, data) => {
  try {
    return await db
      .update(dashboards)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(dashboards.id, id));
  } catch (error) {
    handleDbError(error, "Failed to update dashboard");
  }
};

exports.softDelete = async (id) => {
  try {
    return await db.update(dashboards).set({ active: false, deletedAt: new Date() }).where(eq(dashboards.id, id));
  } catch (error) {
    handleDbError(error, "Failed to delete dashboard");
  }
};

exports.activate = async (id) => {
  try {
    return await db.update(dashboards).set({ active: true, deletedAt: null, updatedAt: new Date() }).where(eq(dashboards.id, id));
  } catch (error) {
    handleDbError(error, "Failed to activate dashboard");
  }
};

exports.deactivate = async (id) => {
  try {
    return await db.update(dashboards).set({ active: false, updatedAt: new Date() }).where(eq(dashboards.id, id));
  } catch (error) {
    handleDbError(error, "Failed to deactivate dashboard");
  }
};

exports.assignDashboardToUser = async (userId, dashboardId) => {
  try {
    const [result] = await db.insert(usersDashboards).values({
      userId,
      dashboardId,
    });
    return result;
  } catch (error) {
    handleDbError(error, "Failed to assign dashboard to user");
  }
};

exports.removeDashboardFromUser = async (userId, dashboardId) => {
  try {
    return await db
      .update(usersDashboards)
      .set({ active: false, deletedAt: new Date() })
      .where(and(eq(usersDashboards.userId, userId), eq(usersDashboards.dashboardId, dashboardId)));
  } catch (error) {
    handleDbError(error, "Failed to remove dashboard from user");
  }
};

exports.findDashboardsForUser = async (userId, accountId) => {
  return await db.execute(sql`
    SELECT DISTINCT
      d.id,
      d.instance_id as instanceId,
      d.superset_dashboard_id as supersetDashboardId,
      d.embedded_id as embeddedId,
      d.name,
      d.reports_id as reportId,
      r.name as reportName,
      w.name as workspaceName,
      d.active,
      d.created_at as createdAt,
      d.updated_at as updatedAt
    FROM users u
    INNER JOIN users_dashboards ud ON ud.user_id = u.id
      AND ud.active = 1 AND ud.deleted_at IS NULL
    INNER JOIN dashboards d ON d.id = ud.dashboard_id
      AND d.active = 1 AND d.deleted_at IS NULL
    INNER JOIN reports r ON r.id = d.report_id
      AND r.active = 1 AND r.deleted_at IS NULL
    INNER JOIN workspaces w ON w.id = r.workspace_id
      AND w.active = 1 AND w.deleted_at IS NULL
    INNER JOIN accounts_instances_workspaces aiw ON aiw.workspace_id = w.id
      AND aiw.active = 1 AND aiw.deleted_at IS NULL
    INNER JOIN accounts_instances ai ON ai.id = aiw.account_instance_id
      AND ai.active = 1 AND ai.deleted_at IS NULL
    WHERE u.id = ${userId}
      AND ai.accounts_id = ${accountId}
      AND u.active = 1 AND u.deleted_at IS NULL
    ORDER BY w.name, r.name, d.name
  `);
};

exports.findUsersForDashboard = async (dashboardId) => {
  return await db.execute(sql`
    SELECT
      u.id,
      u.user_name as userName,
      u.name,
      u.mail,
      ud.active as assignmentActive,
      ud.created_at as assignedAt
    FROM users_dashboards ud
    INNER JOIN users u ON u.id = ud.user_id
    WHERE ud.dashboard_id = ${dashboardId}
      AND ud.deleted_at IS NULL
      AND u.deleted_at IS NULL
  `);
};

exports.userHasAccess = async (userId, dashboardId) => {
  const result = await db
    .select({ count: sql`COUNT(*)` })
    .from(usersDashboards)
    .where(
      and(
        eq(usersDashboards.userId, userId),
        eq(usersDashboards.dashboardId, dashboardId),
        eq(usersDashboards.active, true),
        isNull(usersDashboards.deletedAt)
      )
    );

  return result[0].count > 0;
};

exports.countByReportId = async (reportId) => {
  const result = await db
    .select({ count: sql`COUNT(*)` })
    .from(dashboards)
    .where(and(eq(dashboards.reportId, reportId), eq(dashboards.active, true), isNull(dashboards.deletedAt)));

  return result[0].count;
};

exports.findAllByAccount = async (accountId, options = {}) => {
  const conditions = [isNull(dashboards.deletedAt)];

  if (options.active !== undefined) {
    const activeValue = options.active === true || options.active === "true";
    conditions.push(eq(dashboards.active, activeValue));
  }

  if (options.reportId !== undefined) {
    conditions.push(eq(dashboards.reportId, options.reportId));
  }

  let query = db
    .select({
      id: dashboards.id,
      instanceId: dashboards.instanceId,
      embeddedId: dashboards.embeddedId,
      name: dashboards.name,
      reportId: dashboards.reportId,
      reportName: reports.name,
      active: dashboards.active,
      createdAt: dashboards.createdAt,
      updatedAt: dashboards.updatedAt,
    })
    .from(dashboards)
    .innerJoin(
      reports,
      and(eq(dashboards.reportId, reports.id), eq(reports.active, true), isNull(reports.deletedAt))
    )
    .innerJoin(
      workspaces,
      and(eq(reports.workspaceId, workspaces.id), eq(workspaces.active, true), isNull(workspaces.deletedAt))
    )
    .innerJoin(
      accountsInstancesWorkspaces,
      and(
        eq(accountsInstancesWorkspaces.workspaceId, workspaces.id),
        eq(accountsInstancesWorkspaces.active, true),
        isNull(accountsInstancesWorkspaces.deletedAt)
      )
    )
    .innerJoin(
      accountsInstances,
      and(
        eq(accountsInstances.id, accountsInstancesWorkspaces.accountInstanceId),
        eq(accountsInstances.active, true),
        isNull(accountsInstances.deletedAt),
        eq(accountsInstances.accountId, accountId)
      )
    )
    .where(and(...conditions));

  if (options.limit) {
    query = query.limit(options.limit);
  }

  if (options.offset) {
    query = query.offset(options.offset);
  }

  return await query;
};

exports.findInstancesForWorkspace = async (workspaceId) => {
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
        eq(accountsInstancesWorkspaces.accountInstanceId, accountsInstances.id),
        eq(accountsInstances.active, true),
        isNull(accountsInstances.deletedAt)
      )
    )
    .innerJoin(
      instances,
      and(eq(accountsInstances.instanceId, instances.id), eq(instances.active, true), isNull(instances.deletedAt))
    )
    .where(
      and(
        eq(accountsInstancesWorkspaces.workspaceId, workspaceId),
        eq(accountsInstancesWorkspaces.active, true),
        isNull(accountsInstancesWorkspaces.deletedAt)
      )
    );

  return rows;
};

exports.findActiveAssignmentsForUser = async (userId) => {
  return await db
    .select({
      dashboardId: usersDashboards.dashboardId,
    })
    .from(usersDashboards)
    .where(
      and(
        eq(usersDashboards.userId, userId),
        eq(usersDashboards.active, true),
        isNull(usersDashboards.deletedAt)
      )
    );
};

exports.findDashboardsAssignableToUser = async (targetAccountId) => {
  if (!targetAccountId) {
    const rows = await db
      .select({
        id: dashboards.id,
        instanceId: dashboards.instanceId,
        embeddedId: dashboards.embeddedId,
        name: dashboards.name,
        reportId: dashboards.reportId,
        active: dashboards.active,
        createdAt: dashboards.createdAt,
        updatedAt: dashboards.updatedAt,
      })
      .from(dashboards)
      .innerJoin(
        reports,
        and(eq(dashboards.reportId, reports.id), eq(reports.active, true), isNull(reports.deletedAt))
      )
      .innerJoin(
        workspaces,
        and(eq(reports.workspaceId, workspaces.id), eq(workspaces.active, true), isNull(workspaces.deletedAt))
      )
      .where(and(eq(dashboards.active, true), isNull(dashboards.deletedAt)));

    return rows;
  }

  const rows = await db
    .select({
      id: dashboards.id,
      instanceId: dashboards.instanceId,
      embeddedId: dashboards.embeddedId,
      name: dashboards.name,
      reportId: dashboards.reportId,
      active: dashboards.active,
      createdAt: dashboards.createdAt,
      updatedAt: dashboards.updatedAt,
    })
    .from(dashboards)
    .innerJoin(
      reports,
      and(eq(dashboards.reportId, reports.id), eq(reports.active, true), isNull(reports.deletedAt))
    )
    .innerJoin(
      workspaces,
      and(eq(reports.workspaceId, workspaces.id), eq(workspaces.active, true), isNull(workspaces.deletedAt))
    )
    .innerJoin(
      accountsInstancesWorkspaces,
      and(
        eq(accountsInstancesWorkspaces.workspaceId, workspaces.id),
        eq(accountsInstancesWorkspaces.active, true),
        isNull(accountsInstancesWorkspaces.deletedAt)
      )
    )
    .innerJoin(
      accountsInstances,
      and(
        eq(accountsInstances.id, accountsInstancesWorkspaces.accountInstanceId),
        eq(accountsInstances.active, true),
        isNull(accountsInstances.deletedAt),
        eq(accountsInstances.accountId, targetAccountId)
      )
    )
    .where(
      and(
        eq(dashboards.active, true),
        isNull(dashboards.deletedAt)
      )
    );

  return rows;
};

exports.getDashboardEmbedInfo = async (dashboardId) => {
  const rows = await db
    .select({
      id: dashboards.id,
      instanceId: dashboards.instanceId,
      embeddedId: dashboards.embeddedId,
      name: dashboards.name,
      reportId: dashboards.reportId,
      reportName: reports.name,
      workspaceId: reports.workspaceId,
      workspaceName: workspaces.name,
      instanceId: instances.id,
      instanceName: instances.name,
      baseUrl: instances.baseUrl,
      apiUserName: instances.apiUserName,
      apiPassword: instances.apiPassword,
      active: dashboards.active,
      createdAt: dashboards.createdAt,
      updatedAt: dashboards.updatedAt,
    })
    .from(dashboards)
    .innerJoin(reports, eq(dashboards.reportId, reports.id))
    .innerJoin(workspaces, eq(reports.workspaceId, workspaces.id))
    .innerJoin(
      instances,
      and(eq(instances.id, dashboards.instanceId), eq(instances.active, true), isNull(instances.deletedAt))
    )
    .where(and(eq(dashboards.id, dashboardId), eq(dashboards.active, true), isNull(dashboards.deletedAt)))
    .limit(1);

  return rows[0] || null;
};

exports.findActiveUserById = async (userId) => {
  const rows = await db
    .select({
      id: users.id,
      mail: users.mail,
      name: users.name,
      userName: users.userName,
    })
    .from(users)
    .where(and(eq(users.id, userId), eq(users.active, true), isNull(users.deletedAt)))
    .limit(1);

  return rows[0] || null;
};

module.exports = exports;
