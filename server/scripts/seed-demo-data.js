/**
 * Demo/Test seed: populates the database with sample tenants,
 * Superset instances, workspaces, reports, dashboards, and user assignments.
 *
 * UPDATED FOR NEW EER MODEL:
 * - superset_instances → instances
 * - Eliminado ceiling/floor
 * - Agregado workspaces + accounts_instances_workspaces
 * - reports pertenecen a workspaces
 * - dashboards pertenecen a reports
 * - users_dashboards reemplaza users_reports
 *
 * Flujo:
 * 1. Crear instances (Superset instances)
 * 2. Crear accounts (tenants)
 * 3. Asociar accounts con instances (accounts_instances)
 * 4. Crear workspaces
 * 5. Habilitar workspaces para accounts_instances (accounts_instances_workspaces)
 * 6. Crear reports dentro de workspaces
 * 7. Crear dashboards dentro de reports
 * 8. Crear usuarios de tenant (tenant_admin y user)
 * 9. Asignar dashboards a usuarios (users_dashboards)
 *
 * Usage:
 *   SEED_ENV=./config/.env.dev node scripts/seed-demo-data.js
 */

require("dotenv").config({ path: process.env.SEED_ENV || "./config/.env.dev" });

const {
  ROLE_NAMES,
  logger,
  hashPassword,
  checkConnection,
  verifyRoles,
  ensureRole,
  ensureIntance,
  ensureAccount,
  ensureAccountIntanceLink,
  ensureUser,
  assignRoleToUser,
  ensureWorkspace,
  enableWorkspaceForAccountIntance,
  ensureReport,
  ensureDashboard,
  assignDashboardToUser,
  findAccountByName,
} = require("./seed-utils");

const TENANT_ADMIN_PASSWORD = process.env.SEED_TENANT_ADMIN_PASSWORD || "TenantAdmin#2025";
const USER_PASSWORD = process.env.SEED_USER_PASSWORD || "UserAccess#2025";
const FORCE_DEMO_SEED = process.env.SEED_FORCE === "1";

const INTANCES_DEFINITIONS = [
  {
    name: "Analytics Playground",
    baseUrl: "https://analytics.superset.local",
    apiUserName: "analytics_bot",
    apiPassword: "analytics-secret",
  },
  {
    name: "Operations Superset",
    baseUrl: "https://ops.superset.local",
    apiUserName: "ops_bot",
    apiPassword: "ops-secret",
  },
];

const WORKSPACES_DEFINITIONS = [
  { name: "Sales & Marketing" },
  { name: "Operations & Logistics" },
  { name: "Finance & Analytics" },
];

// Reports y Dashboards organizados por workspace
const REPORTS_AND_DASHBOARDS = [
  {
    workspaceName: "Sales & Marketing",
    reports: [
      {
        name: "Sales Performance Report",
        dashboards: [
          { name: "Monthly Sales Dashboard", instanceId: 101, embeddedId: "uuid-sales-monthly" },
          { name: "Quarterly Sales Dashboard", instanceId: 102, embeddedId: "uuid-sales-quarterly" },
        ],
      },
      {
        name: "Marketing Funnel Report",
        dashboards: [
          { name: "Marketing Overview Dashboard", instanceId: 103, embeddedId: "uuid-marketing-overview" },
        ],
      },
    ],
  },
  {
    workspaceName: "Operations & Logistics",
    reports: [
      {
        name: "Operations KPI Report",
        dashboards: [
          { name: "Operations KPI Board", instanceId: 201, embeddedId: "uuid-ops-kpi" },
          { name: "Logistics Tracking Dashboard", instanceId: 202, embeddedId: "uuid-logistics" },
        ],
      },
    ],
  },
  {
    workspaceName: "Finance & Analytics",
    reports: [
      {
        name: "Financial Summary Report",
        dashboards: [
          { name: "Financial Overview Dashboard", instanceId: 301, embeddedId: "uuid-finance-overview" },
        ],
      },
    ],
  },
];

const TENANT_DEFINITIONS = [
  {
    name: "Acme Analytics",
    subDomain: "acme",
    logoAddress: "1-logo.png",
    intanceName: "Analytics Playground",
    workspaces: ["Sales & Marketing", "Finance & Analytics"],
    users: [
      {
        userName: "acme.admin",
        name: "Acme Administrator",
        mail: "acme.admin@example.com",
        role: ROLE_NAMES.TENANT_ADMIN,
        password: TENANT_ADMIN_PASSWORD,
      },
      {
        userName: "acme.user",
        name: "Acme Regular User",
        mail: "acme.user@example.com",
        role: ROLE_NAMES.USER,
        password: USER_PASSWORD,
        // Asignar dashboards específicos por nombre
        dashboards: ["Monthly Sales Dashboard", "Marketing Overview Dashboard"],
      },
    ],
  },
  {
    name: "Globex Retail",
    subDomain: "globex",
    logoAddress: "1-logo.png",
    intanceName: "Operations Superset",
    workspaces: ["Operations & Logistics"],
    users: [
      {
        userName: "globex.admin",
        name: "Globex Administrator",
        mail: "globex.admin@example.com",
        role: ROLE_NAMES.TENANT_ADMIN,
        password: TENANT_ADMIN_PASSWORD,
      },
      {
        userName: "globex.user",
        name: "Globex Regular User",
        mail: "globex.user@example.com",
        role: ROLE_NAMES.USER,
        password: USER_PASSWORD,
        dashboards: ["Operations KPI Board", "Logistics Tracking Dashboard"],
      },
    ],
  },
  {
    name: "TestClient",
    subDomain: "testclientqa",
    logoAddress: "1-logo.png",
    intanceName: "Analytics Playground",
    workspaces: ["Sales & Marketing", "Operations & Logistics", "Finance & Analytics"],
    users: [
      {
        userName: "testclient.admin",
        name: "TestClient Administrator",
        mail: "testclient.admin@example.com",
        role: ROLE_NAMES.TENANT_ADMIN,
        password: TENANT_ADMIN_PASSWORD,
      },
      {
        userName: "testclient.user",
        name: "TestClient Regular User",
        mail: "testclient.user@example.com",
        role: ROLE_NAMES.USER,
        password: USER_PASSWORD,
        dashboards: ["Monthly Sales Dashboard", "Operations KPI Board", "Financial Overview Dashboard"],
      },
    ],
  },
];

async function shouldSkipDemoSeed() {
  if (FORCE_DEMO_SEED) {
    console.log("SEED_FORCE=1 → reapplying demo data even if it already exists.");
    return false;
  }

  const existingTenant = await findAccountByName("Acme Analytics");
  if (existingTenant) {
    console.log('Demo data already present (found account "Acme Analytics").');
    console.log("Skipping demo seed. Set SEED_FORCE=1 to reapply.");
    return true;
  }

  return false;
}

async function ensurePrerequisites() {
  console.log("➤ Validating base data...");
  await ensureRole(ROLE_NAMES.ROOT_ADMIN);
  await ensureRole(ROLE_NAMES.TENANT_ADMIN);
  await ensureRole(ROLE_NAMES.USER);
  await verifyRoles();
  console.log("  ✓ Roles confirmed");
}

async function seedInstances() {
  console.log("➤ Seeding Superset instances (instances)...");
  const map = new Map();

  for (const intance of INTANCES_DEFINITIONS) {
    const id = await ensureIntance({
      name: intance.name,
      baseUrl: intance.baseUrl,
      apiUserName: intance.apiUserName,
      apiPassword: intance.apiPassword,
      active: true,
    });
    map.set(intance.name, id);
  }

  logger.success(`Created/verified ${map.size} Superset instances`);
  return map;
}

async function createTenantUsers(accountId, tenantDef, dashboardsMap) {
  for (const userDef of tenantDef.users) {
    const passwordHash = await hashPassword(userDef.password);
    const userId = await ensureUser({
      userName: userDef.userName,
      name: userDef.name,
      mail: userDef.mail,
      password: passwordHash,
      accountId: accountId,
      active: true,
    });

    await assignRoleToUser(userId, userDef.role);

    // Asignar dashboards si es un usuario regular
    if (Array.isArray(userDef.dashboards)) {
      for (const dashboardName of userDef.dashboards) {
        const dashboardId = dashboardsMap.get(dashboardName);
        if (!dashboardId) {
          logger.warning(`Dashboard '${dashboardName}' not found; skipping assignment for ${userDef.userName}`);
          continue;
        }
        await assignDashboardToUser(userId, dashboardId);
      }
    }
  }
}

async function seedAccounts(instancesMap) {
  console.log("➤ Creating demo tenants...");

  for (const tenant of TENANT_DEFINITIONS) {
    // 1. Crear account
    const accountId = await ensureAccount({
      name: tenant.name,
      subDomain: tenant.subDomain,
      logoAddress: tenant.logoAddress,
      active: true,
    });

    // 2. Asociar account con intance
    const intanceId = instancesMap.get(tenant.intanceName);
    if (!intanceId) {
      throw new Error(`Superset instance '${tenant.intanceName}' not found for tenant ${tenant.name}`);
    }
    const accountIntanceId = await ensureAccountIntanceLink(accountId, intanceId);

    // 3. Create workspaces, reports and dashboards specific to this tenant
    const dashboardsMapForTenant = new Map();

    for (const workspaceName of tenant.workspaces) {
      const workspaceTemplate = REPORTS_AND_DASHBOARDS.find((w) => w.workspaceName === workspaceName);
      if (!workspaceTemplate) {
        logger.warning(`Workspace template '${workspaceName}' not found; skipping for ${tenant.name}`);
        continue;
      }

      // Create workspace with tenant-prefixed name
      const workspaceId = await ensureWorkspace({
        name: `${tenant.name} - ${workspaceTemplate.workspaceName}`,
        active: true,
      });

      await enableWorkspaceForAccountIntance(accountIntanceId, workspaceId);

      // Create reports and dashboards for this tenant+workspace
      for (const reportDef of workspaceTemplate.reports) {
        const reportId = await ensureReport({
          workspaceId: workspaceId,
          name: `${tenant.name} - ${reportDef.name}`,
          active: true,
        });

        for (const dashboardDef of reportDef.dashboards) {
          const dashboardId = await ensureDashboard({
            reportId,
            instanceId: dashboardDef.instanceId,
            embeddedId: dashboardDef.embeddedId,
            name: `${tenant.name} - ${dashboardDef.name}`,
            active: true,
          });

          // Key by base dashboard name so tenant config can refer to it
          dashboardsMapForTenant.set(dashboardDef.name, dashboardId);
        }
      }
    }

    // 4. Create tenant users and assign dashboards
    await createTenantUsers(accountId, tenant, dashboardsMapForTenant);
  }

  logger.success(`Created/verified ${TENANT_DEFINITIONS.length} tenants with admins and users`);
}

async function main() {
  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║     KPI Managers - Demo/Test Seed            ║");
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

    if (await shouldSkipDemoSeed()) {
      process.exit(0);
    }

    await ensurePrerequisites();
    const instancesMap = await seedInstances();
    await seedAccounts(instancesMap);

    console.log("\n╔══════════════════════════════════════════════╗");
    console.log("║           DEMO SEED COMPLETED ✓              ║");
    console.log("╚══════════════════════════════════════════════╝\n");

    console.log("Tenant admin credentials (login with email only):");
    console.log("┌───────────────────────────────────────────────────────────────────────────────┐");
    console.log("│ Tenant / Subdomain          | Email (login)                 | Password       │");
    console.log("├───────────────────────────────────────────────────────────────────────────────┤");
    TENANT_DEFINITIONS.forEach((tenant) => {
      tenant.users
        .filter((u) => u.role === ROLE_NAMES.TENANT_ADMIN)
        .forEach((u) => {
          const tenantLabel = `${tenant.name} (${tenant.subDomain})`;
          const emailLabel = u.mail;
          const passwordLabel = u.password;
          const line = `${tenantLabel.padEnd(26)}| ${emailLabel.padEnd(27)}| ${passwordLabel.padEnd(14)}`;
          console.log(`│ ${line} │`);
        });
    });
    console.log("└───────────────────────────────────────────────────────────────────────────────┘\n");

    console.log("Tenant user credentials (login with email only):");
    console.log("┌───────────────────────────────────────────────────────────────────────────────┐");
    console.log("│ Tenant / Subdomain          | Email (login)                 | Password       │");
    console.log("├───────────────────────────────────────────────────────────────────────────────┤");
    TENANT_DEFINITIONS.forEach((tenant) => {
      tenant.users
        .filter((u) => u.role === ROLE_NAMES.USER)
        .forEach((u) => {
          const tenantLabel = `${tenant.name} (${tenant.subDomain})`;
          const emailLabel = u.mail;
          const passwordLabel = u.password;
          const line = `${tenantLabel.padEnd(26)}| ${emailLabel.padEnd(27)}| ${passwordLabel.padEnd(14)}`;
          console.log(`│ ${line} │`);
        });
    });
    console.log("└───────────────────────────────────────────────────────────────────────────────┘\n");

    console.log("Demo data structure:");
    console.log("  • 2 Superset instances (instances)");
    console.log("  • 3 Workspaces");
    console.log("  • Multiple reports and dashboards");
    console.log("  • 3 Tenants with admin and regular users");
    console.log("  • Direct dashboard → user assignments (no ceiling/floor)");
    console.log("  • All tenants use logoAddress: 1-logo.png\n");

    console.log("Tenant Subdomains:");
    console.log("  • Acme Analytics:  acme");
    console.log("  • Globex Retail:   globex");
    console.log("  • TestClient:      testclientqa\n");

    console.log("Use these accounts to verify the new permission model.");
    console.log("Re-run with SEED_FORCE=1 to refresh the demo data.\n");

    process.exit(0);
  } catch (error) {
    console.error("\n╔══════════════════════════════════════════════╗");
    console.error("║             DEMO SEED FAILED ✗               ║");
    console.error("╚══════════════════════════════════════════════╝\n");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
}

main();
