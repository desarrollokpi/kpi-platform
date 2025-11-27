/**
 * Multi-Tenant Setup Script
 * Helps initialize the multi-tenant system with roles and optional test data
 * UPDATED FOR NEW EER MODEL
 *
 * Usage: node scripts/setup-multi-tenant.js
 */

require("dotenv").config({ path: "./config/.env.dev" });
const { db } = require("../database");
const { roles } = require("../src/db/schema");
const { ROLE_NAMES } = require("./seed-utils");
const { sql } = require("drizzle-orm");

async function setupRoles() {
  console.log("Setting up roles...");

  try {
    // Insert default roles (will skip if already exist due to UNIQUE constraint)
    const rolesToInsert = [{ name: ROLE_NAMES.ROOT_ADMIN }, { name: ROLE_NAMES.TENANT_ADMIN }, { name: ROLE_NAMES.USER }];

    for (const role of rolesToInsert) {
      try {
        await db.insert(roles).values(role);
        console.log(`✓ Role '${role.name}' created`);
      } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
          console.log(`- Role '${role.name}' already exists`);
        } else {
          throw error;
        }
      }
    }

    console.log("\n✓ Roles setup completed successfully\n");
  } catch (error) {
    console.error("Error setting up roles:", error);
    throw error;
  }
}

async function verifyTables() {
  console.log("Verifying multi-tenant tables (NEW EER MODEL)...");

  const tablesToCheck = [
    "accounts",
    "accountContract",
    "users",
    "roles",
    "usersRoles",
    "instances",
    "accountsInstances",
    "workspaces",
    "accountsInstancesWorkspaces",
    "reports",
    "dashboards",
    "usersDashboards",
  ];

  try {
    for (const table of tablesToCheck) {
      const result = await db.execute(sql`SHOW TABLES LIKE ${table}`);
      if (result[0].length > 0) {
        console.log(`✓ Table '${table}' exists`);
      } else {
        console.log(`✗ Table '${table}' NOT FOUND - run migration first!`);
      }
    }

    console.log("\n");
  } catch (error) {
    console.error("Error verifying tables:", error);
    throw error;
  }
}

async function displayNextSteps() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  Multi-Tenant System Setup Complete (NEW EER MODEL)");
  console.log("═══════════════════════════════════════════════════════════\n");

  console.log("Next Steps:\n");

  console.log("1. Run base seed to create root admin:");
  console.log("   npm run seed:base\n");

  console.log("2. (Optional) Run demo seed to create sample data:");
  console.log("   npm run seed:demo\n");

  console.log("3. Create Superset instances (Root Admin):");
  console.log("   POST /api/superset-instances");
  console.log('   { "name": "Production", "baseUrl": "https://superset.example.com" }\n');

  console.log("4. Create tenants/accounts (Root Admin):");
  console.log("   POST /api/accounts");
  console.log('   { "name": "Acme Corp", "subDomain": "acme", "logoAddress": "/logos/acme.png" }\n');

  console.log("5. Link tenants to Superset instances (Root Admin):");
  console.log("   POST /api/accounts/:accountId/instances");
  console.log('   { "intanceId": 1 }\n');

  console.log("6. Create workspaces (Root Admin):");
  console.log("   POST /api/workspaces");
  console.log('   { "name": "Sales & Marketing" }\n');

  console.log("7. Enable workspaces for account-intance (Root Admin):");
  console.log("   Use accountsInstancesWorkspaces table to link\n");

  console.log("8. Create reports and dashboards within workspaces:");
  console.log("   Reports belong to workspaces");
  console.log("   Dashboards belong to reports\n");

  console.log("9. Assign dashboards to users (Tenant Admin):");
  console.log("   POST /api/access-control/users/:userId/dashboards");
  console.log('   { "dashboardId": 1 }\n');

  console.log("═══════════════════════════════════════════════════════════\n");
  console.log("NEW MODEL HIERARCHY:");
  console.log("  Root Admin");
  console.log("    → Creates Instances (Superset instances)");
  console.log("    → Creates Accounts (Tenants)");
  console.log("    → Links Accounts to Instances");
  console.log("    → Creates Workspaces");
  console.log("    → Enables Workspaces for Account-Instances");
  console.log("");
  console.log("  Tenant Admin");
  console.log("    → Creates Users within their Account");
  console.log("    → Assigns Dashboards to Users");
  console.log("");
  console.log("  Users");
  console.log("    → Access their assigned Dashboards");
  console.log("═══════════════════════════════════════════════════════════\n");
}

async function main() {
  console.log("\n╔═══════════════════════════════════════════════════════════╗");
  console.log("║  Multi-Tenant Access Control System - Setup Script       ║");
  console.log("║                 (NEW EER MODEL)                           ║");
  console.log("╚═══════════════════════════════════════════════════════════╝\n");

  try {
    await verifyTables();
    await setupRoles();
    await displayNextSteps();

    process.exit(0);
  } catch (error) {
    console.error("\n✗ Setup failed:", error.message);
    console.error("\nPlease ensure:");
    console.error("1. Database is running and accessible");
    console.error("2. Migrations have been run: npm run db:push or drizzle-kit push");
    console.error("3. Environment variables are correctly configured\n");
    process.exit(1);
  }
}

main();
