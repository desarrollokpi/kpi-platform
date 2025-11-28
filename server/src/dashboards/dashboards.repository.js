const { db } = require("../../database");
const { eq, and, isNull, sql, desc } = require("drizzle-orm");
const { dashboards, usersDashboards, reports, workspaces, instances, users } = require("../db/schema");

exports.createDashboard = async (dashboardData) => {
  const [result] = await db.insert(dashboards).values(dashboardData);
  return result;
};

exports.findById = async (id) => {
  const result = await db
    .select()
    .from(dashboards)
    .where(and(eq(dashboards.id, id), isNull(dashboards.deletedAt)))
    .limit(1);
  return result[0] || null;
};

exports.findBySupersetId = async (supersetId) => {
  const result = await db
    .select()
    .from(dashboards)
    .where(and(eq(dashboards.supersetId, supersetId), isNull(dashboards.deletedAt)))
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
  return await db
    .update(dashboards)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(dashboards.id, id));
};

exports.softDelete = async (id) => {
  return await db.update(dashboards).set({ active: false, deletedAt: new Date() }).where(eq(dashboards.id, id));
};

exports.assignDashboardToUser = async (idUsers, dashboardsId) => {
  const [result] = await db.insert(usersDashboards).values({
    idUsers,
    dashboardsId,
  });
  return result;
};

exports.removeDashboardFromUser = async (idUsers, dashboardsId) => {
  return await db
    .update(usersDashboards)
    .set({ active: false, deletedAt: new Date() })
    .where(and(eq(usersDashboards.idUsers, idUsers), eq(usersDashboards.dashboardsId, dashboardsId)));
};

exports.findDashboardsForUser = async (userId, accountsId) => {
  return await db.execute(sql`
    SELECT DISTINCT
      d.id,
      d.superset_id as supersetId,
      d.embedded_id as embeddedId,
      d.name,
      d.reports_id as reportId,
      r.name as reportName,
      w.name as workspaceName,
      d.active,
      d.created_at as createdAt,
      d.updated_at as updatedAt
    FROM users u
    INNER JOIN users_dashboards ud ON ud.id_users = u.id
      AND ud.active = 1 AND ud.deleted_at IS NULL
    INNER JOIN dashboards d ON d.id = ud.dashboards_id
      AND d.active = 1 AND d.deleted_at IS NULL
    INNER JOIN reports r ON r.id = d.reports_id
      AND r.active = 1 AND r.deleted_at IS NULL
    INNER JOIN workspaces w ON w.id = r.workspaces_id
      AND w.active = 1 AND w.deleted_at IS NULL
    INNER JOIN accounts_instances_workspaces aiw ON aiw.id_workspaces = w.id
      AND aiw.active = 1 AND aiw.deleted_at IS NULL
    INNER JOIN accounts_instances ai ON ai.id = aiw.id_accounts_instances
      AND ai.active = 1 AND ai.deleted_at IS NULL
    WHERE u.id = ${userId}
      AND ai.accounts_id = ${accountsId}
      AND u.active = 1 AND u.deleted_at IS NULL
    ORDER BY w.name, r.name, d.name
  `);
};

exports.findUsersForDashboard = async (dashboardsId) => {
  return await db.execute(sql`
    SELECT
      u.id,
      u.user_name as userName,
      u.name,
      u.mail,
      ud.active as assignmentActive,
      ud.created_at as assignedAt
    FROM users_dashboards ud
    INNER JOIN users u ON u.id = ud.id_users
    WHERE ud.dashboards_id = ${dashboardsId}
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
        eq(usersDashboards.idUsers, userId),
        eq(usersDashboards.dashboardsId, dashboardId),
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

exports.getDashboardEmbedInfo = async (dashboardId) => {
  const rows = await db
    .select({
      id: dashboards.id,
      supersetId: dashboards.supersetId,
      embeddedId: dashboards.embeddedId,
      name: dashboards.name,
      reportId: dashboards.reportId,
      reportName: reports.name,
      workspacesId: reports.workspacesId,
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
    .innerJoin(workspaces, eq(reports.workspacesId, workspaces.id))
    .innerJoin(
      instances,
      and(eq(instances.id, dashboards.supersetId), eq(instances.active, true), isNull(instances.deletedAt))
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
