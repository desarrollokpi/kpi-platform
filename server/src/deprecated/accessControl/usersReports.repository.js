/**
 * Users Reports Repository
 * Handles Tenant Admin assignment of specific reports to users
 */

const { db } = require("../connection");
const { eq, and, sql } = require("drizzle-orm");
const { usersReports } = require("../schema");

/**
 * Assign a report to a user (Tenant Admin operation)
 */
exports.assignReportToUser = async (userId, reportId, active = 1) => {
  return await db.insert(usersReports).values({
    userId,
    reportId,
    active,
  });
};

/**
 * Remove report assignment from user
 */
exports.removeReportFromUser = async (userId, reportId) => {
  return await db.delete(usersReports).where(and(eq(usersReports.userId, userId), eq(usersReports.reportId, reportId)));
};

/**
 * Get all reports assigned to a user
 */
exports.getReportsByUserId = async (userId) => {
  const [rows] = await db.execute(sql`
    SELECT
      r.id_report AS id,
      r.name,
      r.id_workspace AS workspacesId,
      r.active,
      ur.active AS assignmentActive
    FROM users_reports ur
    INNER JOIN adm_account_reports r ON ur.report_id = r.id_report
    WHERE ur.user_id = ${userId}
  `);
  return rows;
};

/**
 * Get all active reports assigned to a user
 */
exports.getActiveReportsByUserId = async (userId) => {
  const [rows] = await db.execute(sql`
    SELECT
      r.id_report AS id,
      r.name,
      r.id_workspace AS workspacesId,
      r.active
    FROM users_reports ur
    INNER JOIN adm_account_reports r ON ur.report_id = r.id_report
    WHERE
      ur.user_id = ${userId}
      AND ur.active = 1
      AND r.active = 1
  `);
  return rows;
};

/**
 * Check if user has access to a specific report
 */
exports.userHasReportAccess = async (userId, reportId) => {
  const [rows] = await db.execute(sql`
    SELECT 1
    FROM users_reports
    WHERE user_id = ${userId} AND report_id = ${reportId} AND active = 1
    LIMIT 1
  `);
  return rows.length > 0;
};

/**
 * Update report assignment status
 */
exports.updateReportAssignment = async (userId, reportId, active) => {
  return await db
    .update(usersReports)
    .set({ active })
    .where(and(eq(usersReports.userId, userId), eq(usersReports.reportId, reportId)));
};

/**
 * Get all users that have access to a specific report
 */
exports.getUsersByReportId = async (reportId) => {
  const [rows] = await db.execute(sql`
    SELECT
      ur.user_id AS userId,
      u.username,
      u.name,
      ur.active
    FROM users_reports ur
    INNER JOIN adm_users u ON ur.user_id = u.id
    WHERE ur.report_id = ${reportId}
  `);
  return rows;
};

/**
 * Bulk assign reports to user
 */
exports.bulkAssignReportsToUser = async (userId, reportIds) => {
  const values = reportIds.map((reportId) => ({
    userId,
    reportId,
    active: 1,
  }));
  return await db.insert(usersReports).values(values);
};

/**
 * Get reports available for a user considering both account and user assignments
 * This implements the multi-tenant access control logic:
 * User can see a report if:
 * 1. Account has access (via accounts_workspaces OR accounts_reports)
 * 2. AND user has access (via users_reports)
 */
exports.getAvailableReportsForUser = async (userId) => {
  // First get the user's account
  const [userRows] = await db.execute(sql`
    SELECT id_adm_accounts AS accountsId
    FROM adm_users
    WHERE id = ${userId}
    LIMIT 1
  `);

  if (!userRows.length) return [];

  const accountId = userRows[0].accountsId;

  const [rows] = await db.execute(sql`
    SELECT DISTINCT
      r.id_report AS id,
      r.name,
      r.id_workspace AS workspacesId,
      r.active
    FROM users_reports ur
    INNER JOIN adm_account_reports r ON ur.report_id = r.id_report
    LEFT JOIN accounts_reports ar
      ON ar.report_id = r.id_report
      AND ar.account_id = ${accountId}
      AND ar.active = 1
    LEFT JOIN adm_account_workspaces aw
      ON aw.id_workspace = r.id_workspace
      AND aw.id_adm_accounts = ${accountId}
    WHERE
      ur.user_id = ${userId}
      AND ur.active = 1
      AND r.active = 1
      AND (ar.account_id IS NOT NULL OR aw.id_adm_accounts IS NOT NULL)
  `);

  return rows;
};
