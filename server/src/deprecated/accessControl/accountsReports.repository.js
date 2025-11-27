/**
 * Accounts Reports Repository
 * Handles Root Admin assignment of specific reports to tenants
 */

const { db } = require("../connection");
const { eq, and, sql } = require("drizzle-orm");
const { accountsReports } = require("../schema");

/**
 * Assign a report to an account (Root Admin operation)
 */
exports.assignReportToAccount = async (accountId, reportId, active = 1) => {
  return await db.insert(accountsReports).values({
    accountId,
    reportId,
    active,
  });
};

/**
 * Remove report assignment from account
 */
exports.removeReportFromAccount = async (accountId, reportId) => {
  return await db.delete(accountsReports).where(and(eq(accountsReports.accountId, accountId), eq(accountsReports.reportId, reportId)));
};

/**
 * Get all reports assigned to an account
 */
exports.getReportsByAccountId = async (accountId) => {
  const [rows] = await db.execute(sql`
    SELECT
      r.id_report AS id,
      r.name,
      r.id_workspace AS workspacesId,
      r.active,
      ar.active AS assignmentActive
    FROM accounts_reports ar
    INNER JOIN adm_account_reports r ON ar.report_id = r.id_report
    WHERE ar.account_id = ${accountId}
  `);
  return rows;
};

/**
 * Get all active reports assigned to an account
 */
exports.getActiveReportsByAccountId = async (accountId) => {
  const [rows] = await db.execute(sql`
    SELECT
      r.id_report AS id,
      r.name,
      r.id_workspace AS workspacesId,
      r.active
    FROM accounts_reports ar
    INNER JOIN adm_account_reports r ON ar.report_id = r.id_report
    WHERE
      ar.account_id = ${accountId}
      AND ar.active = 1
      AND r.active = 1
  `);
  return rows;
};

/**
 * Check if account has access to a specific report
 */
exports.accountHasReportAccess = async (accountId, reportId) => {
  const [rows] = await db.execute(sql`
    SELECT 1
    FROM accounts_reports
    WHERE account_id = ${accountId} AND report_id = ${reportId} AND active = 1
    LIMIT 1
  `);
  return rows.length > 0;
};

/**
 * Update report assignment status
 */
exports.updateReportAssignment = async (accountId, reportId, active) => {
  return await db
    .update(accountsReports)
    .set({ active })
    .where(and(eq(accountsReports.accountId, accountId), eq(accountsReports.reportId, reportId)));
};

/**
 * Get all accounts that have access to a specific report
 */
exports.getAccountsByReportId = async (reportId) => {
  const [rows] = await db.execute(sql`
    SELECT
      account_id AS accountId,
      active
    FROM accounts_reports
    WHERE report_id = ${reportId}
  `);
  return rows;
};

/**
 * Bulk assign reports to account
 */
exports.bulkAssignReportsToAccount = async (accountId, reportIds) => {
  const values = reportIds.map((reportId) => ({
    accountId,
    reportId,
    active: 1,
  }));
  return await db.insert(accountsReports).values(values);
};
