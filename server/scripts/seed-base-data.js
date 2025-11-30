/**
 * Base seed: creates the minimum data required to start the platform.
 * - Inserts default roles (root_admin, tenant_admin, user)
 * - Creates a primary Superset instance (instances)
 * - Creates a global Root Admin user (no tenant)
 *
 * UPDATED FOR NEW EER MODEL:
 * - superset_instances → instances
 * - username → user_name
 * - email → mail
 * - accountId → account_id (nullable)
 *
 * Usage:
 *   SEED_ENV=./config/.env.dev node scripts/seed-base-data.js
 */

require("dotenv").config({ path: process.env.SEED_ENV || "./config/.env.dev" });

const {
  ROLE_NAMES,
  logger,
  hashPassword,
  checkConnection,
  verifyRoles,
  ensureRole,
  ensureUser,
  assignRoleToUser,
} = require("./seed-utils");

const ROOT_USERNAME = process.env.SEED_ROOT_USERNAME || "root.admin";
const ROOT_EMAIL = process.env.SEED_ROOT_EMAIL || "root.admin@kpimanagers.com";
const ROOT_PASSWORD = process.env.SEED_ROOT_PASSWORD || "RootAdmin#2025";
const ROOT_NAME = process.env.SEED_ROOT_NAME || "Root Administrator";

async function seedRoles() {
  console.log("➤ Ensuring default roles exist...");
  await ensureRole(ROLE_NAMES.ROOT_ADMIN);
  await ensureRole(ROLE_NAMES.TENANT_ADMIN);
  await ensureRole(ROLE_NAMES.USER);
  console.log("  ✓ Roles ready");
}

async function seedRootAdmin() {
  console.log("➤ Creating root admin user...");

  const passwordHash = await hashPassword(ROOT_PASSWORD);
  const rootUserId = await ensureUser({
    userName: ROOT_USERNAME,
    name: ROOT_NAME,
    mail: ROOT_EMAIL,
    password: passwordHash,
    accountId: null, // Root admin no pertenece a ningún tenant
    active: true,
  });

  await assignRoleToUser(rootUserId, ROLE_NAMES.ROOT_ADMIN);

  console.log("  ✓ Root admin user ready (id:", rootUserId, ")");
  return rootUserId;
}

async function main() {
  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║     KPI Managers - Base Seed Initialization  ║");
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

    await seedRoles();
    const rolesOk = await verifyRoles();
    if (!rolesOk) {
      logger.error("Failed to create all required roles");
      process.exit(1);
    }

    const rootUserId = await seedRootAdmin();

    console.log("\n╔══════════════════════════════════════════════╗");
    console.log("║             SEED COMPLETED ✓                 ║");
    console.log("╚══════════════════════════════════════════════╝\n");

    console.log("Root Admin credentials (login with email only):");
    console.log("┌────────────────────────────────────────────┐");
    console.log(`│ Email (login): ${ROOT_EMAIL.padEnd(27)}│`);
    console.log(`│ Password:      ${ROOT_PASSWORD.padEnd(27)}│`);
    console.log(`│ Name:          ${ROOT_NAME.padEnd(27)}│`);
    console.log(`│ Username:      ${ROOT_USERNAME.padEnd(27)}│`);
    console.log(`│ User ID:       ${String(rootUserId).padEnd(27)}│`);
    console.log("└────────────────────────────────────────────┘\n");

    console.log("Next Steps:");
    console.log("  1. Log in with the root admin credentials");
    console.log("  2. Create tenants (accounts)");
    console.log("  3. Associate tenants with Superset instances");
    console.log("  4. Create workspaces and enable them for tenants");
    console.log("  5. Create reports and dashboards within workspaces");
    console.log("  6. Assign dashboards to users");
    console.log("  7. (Optional) Run seed:demo for sample tenants\n");

    process.exit(0);
  } catch (error) {
    console.error("\n╔══════════════════════════════════════════════╗");
    console.error("║             SEED FAILED ✗                    ║");
    console.error("╚══════════════════════════════════════════════╝\n");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
}

main();
