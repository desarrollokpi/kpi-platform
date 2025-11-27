/**
 * Access Control Services
 * Enforces multi-tenant access control rules for Root Admin → Tenant Admin → Users hierarchy
 */

const accountsReportsRepo = require("../db/repositories/accountsReports.repository");
const usersReportsRepo = require("../db/repositories/usersReports.repository");
const rolesService = require("../../roles/roles.services");
const { db } = require("../../../database");
const { accountsWorkspaces } = require("../../db/schema");
const { sql } = require("drizzle-orm");

const getUserAccountId = async (userId) => {
  const [rows] = await db.execute(sql`
    SELECT id_adm_accounts AS accountsId
    FROM adm_users
    WHERE id = ${userId}
    LIMIT 1
  `);

  return rows[0]?.accountsId;
};

/**
 * ROOT ADMIN OPERATIONS
 */

/**
 * Assign workspace to account (Root Admin)
 * Gives tenant access to all reports in the workspace
 */
exports.assignWorkspaceToAccount = async (accountId, workspaceId) => {
  // This uses the existing adm_account_workspaces table
  return await db.insert(accountsWorkspaces).values({
    idAccounts: accountId,
    idWorkspaces: workspaceId,
  });
};

/**
 * Assign specific report to account (Root Admin)
 * Gives tenant access to a specific report
 */
exports.assignReportToAccount = async (accountId, reportId) => {
  return await accountsReportsRepo.assignReportToAccount(accountId, reportId);
};

/**
 * Remove report from account (Root Admin)
 */
exports.removeReportFromAccount = async (accountId, reportId) => {
  return await accountsReportsRepo.removeReportFromAccount(accountId, reportId);
};

/**
 * Get all reports available to an account (Tenant Admin view)
 * Shows what reports Root Admin has enabled for this tenant
 */
exports.getAccountAvailableReports = async (accountId) => {
  const [workspaceReports] = await db.execute(sql`
    SELECT
      r.id_report AS id,
      r.name,
      r.id_workspace AS workspacesId,
      w.name AS workspaceName,
      r.active,
      'workspace' AS source
    FROM adm_account_workspaces aw
    INNER JOIN adm_workspaces w ON aw.id_workspace = w.id
    INNER JOIN adm_account_reports r ON w.id = r.id_workspace
    WHERE
      aw.id_adm_accounts = ${accountId}
      AND r.active = 1
  `);

  const [directReports] = await db.execute(sql`
    SELECT
      r.id_report AS id,
      r.name,
      r.id_workspace AS workspacesId,
      w.name AS workspaceName,
      r.active,
      'direct' AS source
    FROM accounts_reports ar
    INNER JOIN adm_account_reports r ON ar.report_id = r.id_report
    LEFT JOIN adm_workspaces w ON r.id_workspace = w.id
    WHERE
      ar.account_id = ${accountId}
      AND ar.active = 1
      AND r.active = 1
  `);

  const allReports = [...workspaceReports, ...directReports];
  const uniqueReports = Array.from(new Map(allReports.map((r) => [r.id, r])).values());

  return uniqueReports;
};

/**
 * TENANT ADMIN OPERATIONS
 */

/**
 * Assign report to user (Tenant Admin)
 * Can only assign reports that are available to the tenant
 */
exports.assignReportToUser = async (tenantAdminId, userId, reportId) => {
  const accountId = await getUserAccountId(userId);

  if (!accountId) {
    throw new Error("User not found");
  }

  const adminAccountId = await getUserAccountId(tenantAdminId);

  if (!adminAccountId || adminAccountId !== accountId) {
    throw new Error("Tenant Admin can only assign reports to users in their account");
  }

  const accountHasAccess = await this.accountHasReportAccess(accountId, reportId);
  if (!accountHasAccess) {
    throw new Error("Account does not have access to this report. Contact Root Admin.");
  }

  return await usersReportsRepo.assignReportToUser(userId, reportId);
};

/**
 * Remove report from user (Tenant Admin)
 */
exports.removeReportFromUser = async (tenantAdminId, userId, reportId) => {
  const accountId = await getUserAccountId(userId);
  const adminAccountId = await getUserAccountId(tenantAdminId);

  if (!accountId || !adminAccountId) {
    throw new Error("User or admin not found");
  }

  if (accountId !== adminAccountId) {
    throw new Error("Tenant Admin can only manage users in their account");
  }

  return await usersReportsRepo.removeReportFromUser(userId, reportId);
};

/**
 * USER ACCESS VERIFICATION
 */

/**
 * Check if user can access a report
 * Implements the full access control logic:
 * 1. Account has access (via workspace or direct assignment)
 * 2. AND user has access (via users_reports or users_sections)
 */
exports.userCanAccessReport = async (userId, reportId) => {
  const accountId = await getUserAccountId(userId);
  if (!accountId) return false;

  const accountHasAccess = await this.accountHasReportAccess(accountId, reportId);
  if (!accountHasAccess) return false;

  const hasDirectAccess = await usersReportsRepo.userHasReportAccess(userId, reportId);
  if (hasDirectAccess) return true;

  const [sectionsRows] = await db.execute(sql`
    SELECT 1
    FROM adm_users_sections
    WHERE id_users = ${userId} AND id_reports = ${reportId}
    LIMIT 1
  `);

  return sectionsRows.length > 0;
};

/**
 * Check if account has access to a report
 * Via workspace assignment OR direct report assignment
 */
exports.accountHasReportAccess = async (accountId, reportId) => {
  // Check direct assignment
  const hasDirectAccess = await accountsReportsRepo.accountHasReportAccess(accountId, reportId);
  if (hasDirectAccess) return true;

  const [workspaceRows] = await db.execute(sql`
    SELECT 1
    FROM adm_account_reports r
    INNER JOIN adm_account_workspaces aw ON r.id_workspace = aw.id_workspace
    WHERE r.id_report = ${reportId} AND aw.id_adm_accounts = ${accountId}
    LIMIT 1
  `);

  return workspaceRows.length > 0;
};

/**
 * Get all reports accessible by a user
 * Full multi-tenant filtering
 */
exports.getUserAccessibleReports = async (userId) => {
  const accountId = await getUserAccountId(userId);
  if (!accountId) return [];

  const directReports = await usersReportsRepo.getAvailableReportsForUser(userId);
  const directReportIds = new Set(directReports.map((report) => report.id));

  const [sectionReports] = await db.execute(sql`
    SELECT DISTINCT
      r.id_report AS id,
      r.name,
      r.id_workspace AS workspacesId,
      r.active
    FROM adm_users_sections us
    INNER JOIN adm_account_sections s
      ON us.id_sections = s.id_section
      AND us.id_reports = s.id_report
    INNER JOIN adm_account_reports r ON s.id_report = r.id_report
    WHERE
      us.id_users = ${userId}
      AND r.active = 1
  `);

  const combinedMap = new Map();
  directReports.forEach((report) => combinedMap.set(report.id, report));
  sectionReports.forEach((report) => {
    if (!combinedMap.has(report.id)) {
      combinedMap.set(report.id, report);
    }
  });

  const accessibleReports = [];
  for (const report of combinedMap.values()) {
    if (directReportIds.has(report.id)) {
      accessibleReports.push(report);
      continue;
    }

    const hasAccess = await this.accountHasReportAccess(accountId, report.id);
    if (hasAccess) {
      accessibleReports.push(report);
    }
  }

  return accessibleReports;
};
