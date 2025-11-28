/**
 * Cleanup script: Removes demo/test data inserted by seed:demo.
 * UPDATED FOR NEW EER MODEL
 *
 * Usage:
 *   SEED_ENV=./config/.env.dev node scripts/cleanup-demo-data.js
 */

require("dotenv").config({ path: process.env.SEED_ENV || "./config/.env.dev" });

const { eq, inArray, sql } = require("drizzle-orm");
const { db } = require("../database");
const {
  accounts,
  users,
  usersRoles,
  usersDashboards,
  accountsInstances,
  accountsInstancesWorkspaces,
  instances,
  workspaces,
  reports,
  dashboards,
} = require("../src/db/schema");
const { logger, checkConnection } = require("./seed-utils");

const DEMO_TENANT_NAMES = ["Acme Analytics", "Globex Retail", "TestClient"];
const DEMO_INTANCE_NAMES = ["Analytics Playground", "Operations Superset"];
const DEMO_WORKSPACE_NAMES = ["Sales & Marketing", "Operations & Logistics", "Finance & Analytics"];

async function deleteDemoData() {
  console.log("➤ Identifying demo data...");

  // 1. Find demo accounts
  const demoAccounts = await db.select({ id: accounts.id }).from(accounts).where(inArray(accounts.name, DEMO_TENANT_NAMES));

  const accountIds = demoAccounts.map((account) => account.id);

  if (!accountIds.length) {
    logger.info("No demo accounts found. Database is already clean.");
    return { deleted: false, accountCount: 0, userCount: 0 };
  }

  logger.info(`Found ${accountIds.length} demo accounts to delete`);

  // 2. Find demo users
  const demoUsers = await db.select({ id: users.id }).from(users).where(inArray(users.accountsId, accountIds));

  const userIds = demoUsers.map((user) => user.id);
  logger.info(`Found ${userIds.length} demo users`);

  // 3. Delete user-dashboard assignments
  if (userIds.length) {
    await db.delete(usersDashboards).where(inArray(usersDashboards.idUsers, userIds));
    logger.success("Deleted user dashboard assignments");

    // 4. Delete user-role assignments
    await db.delete(usersRoles).where(inArray(usersRoles.usersId, userIds));
    logger.success("Deleted user role assignments");

    // 5. Delete demo users
    await db.delete(users).where(inArray(users.id, userIds));
    logger.success("Deleted demo users");
  }

  // 6. Delete account-workspace-instance links
  const accountIntanceLinks = await db.select({ id: accountsInstances.id }).from(accountsInstances).where(inArray(accountsInstances.accountsId, accountIds));

  const accountIntanceIds = accountIntanceLinks.map((link) => link.id);

  if (accountIntanceIds.length) {
    await db.delete(accountsInstancesWorkspaces).where(inArray(accountsInstancesWorkspaces.idAccountsInstances, accountIntanceIds));
    logger.success("Deleted account-workspace links");
  }

  // 7. Delete account-intance links
  await db.delete(accountsInstances).where(inArray(accountsInstances.accountsId, accountIds));
  logger.success("Deleted account-intance links");

  // 8. Delete demo accounts
  await db.delete(accounts).where(inArray(accounts.id, accountIds));
  logger.success("Deleted demo accounts");

  // 9. Delete demo workspaces
  const demoWorkspaces = await db.select({ id: workspaces.id }).from(workspaces).where(inArray(workspaces.name, DEMO_WORKSPACE_NAMES));

  const workspaceIds = demoWorkspaces.map((ws) => ws.id);

  if (workspaceIds.length) {
    // Delete reports that belong to demo workspaces
    const demoReports = await db.select({ id: reports.id }).from(reports).where(inArray(reports.workspacesId, workspaceIds));

    const reportIds = demoReports.map((report) => report.id);

    if (reportIds.length) {
      // Delete dashboards that belong to demo reports
      const demoDashboards = await db.select({ id: dashboards.id }).from(dashboards).where(inArray(dashboards.reportId, reportIds));

      const dashboardIds = demoDashboards.map((dashboard) => dashboard.id);

      if (dashboardIds.length) {
        // Delete user-dashboard assignments
        await db.delete(usersDashboards).where(inArray(usersDashboards.dashboardsId, dashboardIds));
        logger.success("Deleted dashboard assignments");

        // Delete dashboards
        await db.delete(dashboards).where(inArray(dashboards.id, dashboardIds));
        logger.success("Deleted demo dashboards");
      }

      // Delete reports
      await db.delete(reports).where(inArray(reports.id, reportIds));
      logger.success("Deleted demo reports");
    }

    // Delete workspace-account-intance links
    await db.delete(accountsInstancesWorkspaces).where(inArray(accountsInstancesWorkspaces.idWorkspaces, workspaceIds));

    // Delete workspaces
    await db.delete(workspaces).where(inArray(workspaces.id, workspaceIds));
    logger.success("Deleted demo workspaces");
  }

  // 10. Delete demo instances (Superset instances)
  const demoInstances = await db.select({ id: instances.id }).from(instances).where(inArray(instances.name, DEMO_INTANCE_NAMES));

  const intanceIds = demoInstances.map((instance) => instance.id);

  if (intanceIds.length) {
    await db.delete(accountsInstances).where(inArray(accountsInstances.instancesId, intanceIds));
    await db.delete(instances).where(inArray(instances.id, intanceIds));
    logger.success("Deleted demo Superset instances (instances)");
  }

  return { deleted: true, accountCount: accountIds.length, userCount: userIds.length };
}

async function resetAutoIncrements() {
  console.log("➤ Resetting auto-increment counters...");

  const maxAccountId = await db.execute(sql`SELECT COALESCE(MAX(id), 0) as maxId FROM accounts`);
  const maxUserId = await db.execute(sql`SELECT COALESCE(MAX(id), 0) as maxId FROM users`);
  const maxIntanceId = await db.execute(sql`SELECT COALESCE(MAX(id), 0) as maxId FROM instances`);
  const maxWorkspaceId = await db.execute(sql`SELECT COALESCE(MAX(id), 0) as maxId FROM workspaces`);
  const maxReportId = await db.execute(sql`SELECT COALESCE(MAX(id), 0) as maxId FROM reports`);
  const maxDashboardId = await db.execute(sql`SELECT COALESCE(MAX(id), 0) as maxId FROM dashboards`);

  const nextAccountId = (maxAccountId[0]?.[0]?.maxId || 0) + 1;
  const nextUserId = (maxUserId[0]?.[0]?.maxId || 0) + 1;
  const nextIntanceId = (maxIntanceId[0]?.[0]?.maxId || 0) + 1;
  const nextWorkspaceId = (maxWorkspaceId[0]?.[0]?.maxId || 0) + 1;
  const nextReportId = (maxReportId[0]?.[0]?.maxId || 0) + 1;
  const nextDashboardId = (maxDashboardId[0]?.[0]?.maxId || 0) + 1;

  await db.execute(sql`ALTER TABLE accounts AUTO_INCREMENT = ${nextAccountId}`);
  await db.execute(sql`ALTER TABLE users AUTO_INCREMENT = ${nextUserId}`);
  await db.execute(sql`ALTER TABLE instances AUTO_INCREMENT = ${nextIntanceId}`);
  await db.execute(sql`ALTER TABLE workspaces AUTO_INCREMENT = ${nextWorkspaceId}`);
  await db.execute(sql`ALTER TABLE reports AUTO_INCREMENT = ${nextReportId}`);
  await db.execute(sql`ALTER TABLE dashboards AUTO_INCREMENT = ${nextDashboardId}`);

  await db.execute(sql`ALTER TABLE accountsInstances AUTO_INCREMENT = 1`);
  await db.execute(sql`ALTER TABLE accountsInstancesWorkspaces AUTO_INCREMENT = 1`);
  await db.execute(sql`ALTER TABLE usersDashboards AUTO_INCREMENT = 1`);
  await db.execute(sql`ALTER TABLE usersRoles AUTO_INCREMENT = 1`);

  logger.success("Auto-increment counters reset");
}

async function verifyCleanup() {
  console.log("➤ Verifying cleanup...");

  const remainingDemoAccounts = await db.select({ id: accounts.id }).from(accounts).where(inArray(accounts.name, DEMO_TENANT_NAMES));

  if (remainingDemoAccounts.length) {
    logger.warning("Demo accounts still exist after cleanup");
    return false;
  }

  logger.success("Demo data successfully removed");
  return true;
}

async function main() {
  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║     KPI Managers - Demo Data Cleanup         ║");
  console.log("║           (NEW EER MODEL)                    ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  try {
    logger.info("Checking database connection...");
    const connected = await checkConnection();
    if (!connected) {
      logger.error("Cannot connect to database. Check your .env configuration.");
      process.exit(1);
    }
    logger.success("Database connection OK");

    const result = await deleteDemoData();

    if (!result.deleted) {
      console.log("\n╔══════════════════════════════════════════════╗");
      console.log("║           CLEANUP SKIPPED (Already Clean)    ║");
      console.log("╚══════════════════════════════════════════════╝\n");
      process.exit(0);
    }

    await resetAutoIncrements();
    const verified = await verifyCleanup();

    console.log("\n╔══════════════════════════════════════════════╗");
    console.log("║           CLEANUP COMPLETED ✓                ║");
    console.log("╚══════════════════════════════════════════════╝\n");

    console.log("Summary:");
    console.log("┌────────────────────────────────────────────┐");
    console.log(`│ Demo accounts deleted:  ${String(result.accountCount).padEnd(20)} │`);
    console.log(`│ Demo users deleted:     ${String(result.userCount).padEnd(20)} │`);
    console.log("│ Auto-increments reset:  Yes                │");
    console.log("└────────────────────────────────────────────┘\n");

    console.log("Next Steps:");
    console.log("  1. Run seed:demo to repopulate demo data if needed");
    console.log("  2. Or start fresh with your own tenant data\n");

    process.exit(verified ? 0 : 1);
  } catch (error) {
    console.error("\n╔══════════════════════════════════════════════╗");
    console.error("║           CLEANUP FAILED ✗                   ║");
    console.error("╚══════════════════════════════════════════════╝\n");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
}

main();
