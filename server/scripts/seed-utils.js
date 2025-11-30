/**
 * Shared helper functions for seeding the KPI Managers platform.
 * All helpers rely on Drizzle for write operations and gracefully
 * skip inserts when the record already exists.
 *
 * UPDATED FOR NEW EER MODEL:
 * - superset_instances → instances
 * - accounts_superset_instances → accounts_instances
 * - Eliminado ceiling/floor (accounts_reports_ceiling, accounts_reports_floor)
 * - Eliminado users_reports
 * - Agregado workspaces + accounts_instances_workspaces
 * - Agregado dashboards + users_dashboards
 * - reports ahora pertenece a workspaces
 */

const bcrypt = require("bcryptjs");
const { eq, and, sql } = require("drizzle-orm");
const { db } = require("../database");
const {
  accounts,
  accountContract,
  users,
  roles,
  usersRoles,
  instances,
  accountsInstances,
  workspaces,
  accountsInstancesWorkspaces,
  reports,
  dashboards,
  usersDashboards,
} = require("../src/db/schema");

const DEFAULT_ROLE_NAMES = {
  ROOT_ADMIN: "root_admin",
  TENANT_ADMIN: "tenant_admin",
  USER: "user",
};

let ROLE_NAMES = DEFAULT_ROLE_NAMES;
try {
  const schemaRoles = require("../src/db/schema/roles");
  if (schemaRoles && schemaRoles.ROLE_NAMES) {
    ROLE_NAMES = schemaRoles.ROLE_NAMES;
  }
} catch (error) {
  // eslint-disable-next-line no-console
  console.warn("ROLE_NAMES not exported from schema, using defaults");
}

const SALT_ROUNDS = parseInt(process.env.SEED_SALT_ROUNDS || "10", 10);

const logger = {
  info: (msg) => console.log(`  ℹ ${msg}`),
  success: (msg) => console.log(`  ✓ ${msg}`),
  warning: (msg) => console.log(`  ⚠ ${msg}`),
  error: (msg) => console.error(`  ✗ ${msg}`),
};

async function hashPassword(plainText) {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

async function checkConnection() {
  try {
    await db.execute(sql`SELECT 1 as ping`);
    return true;
  } catch (error) {
    logger.error(`Database connection failed: ${error.message}`);
    return false;
  }
}

async function verifyRoles() {
  try {
    const allRoles = await db.select().from(roles);
    const roleNames = allRoles.map((role) => role.name);
    const requiredRoles = [ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN, ROLE_NAMES.USER];
    const missing = requiredRoles.filter((roleName) => !roleNames.includes(roleName));

    if (missing.length) {
      logger.warning(`Missing roles: ${missing.join(", ")}`);
      return false;
    }

    logger.success("All required roles exist");
    return true;
  } catch (error) {
    logger.error(`Failed to verify roles: ${error.message}`);
    return false;
  }
}

async function ensureRole(name) {
  const existing = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, name)).limit(1);

  if (existing.length) {
    return existing[0].id;
  }

  await db.insert(roles).values({ name, active: true });

  const created = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, name)).limit(1);

  return created[0].id;
}

async function assignRoleToUser(userId, roleName) {
  const roleId = await ensureRole(roleName);

  const existing = await db
    .select({ id: usersRoles.id })
    .from(usersRoles)
    .where(and(eq(usersRoles.userId, userId), eq(usersRoles.roleId, roleId)))
    .limit(1);

  if (existing.length) {
    return existing[0].id;
  }

  const inserted = await db.insert(usersRoles).values({ userId, roleId, active: true });
  return inserted?.[0]?.insertId || roleId;
}

/**
 * Crea o actualiza una instancia de Superset (instances)
 * Reemplaza: ensureSupersetInstance
 */
async function ensureIntance({ name, baseUrl, apiUserName, apiPassword, active = true }) {
  const existing = await db.select({ id: instances.id }).from(instances).where(eq(instances.name, name)).limit(1);

  if (existing.length) {
    return existing[0].id;
  }

  await db.insert(instances).values({
    name,
    baseUrl,
    apiUserName,
    apiPassword,
    active,
  });

  const created = await db.select({ id: instances.id }).from(instances).where(eq(instances.name, name)).limit(1);

  return created[0].id;
}

/**
 * Crea o actualiza un account (tenant)
 * ACTUALIZADO: usa snake_case (sub_domain, data_base, key_user, logo_address)
 */
async function ensureAccount({ name, subDomain, dataBase = null, keyUser = null, password = null, logoAddress = null, active = true }) {
  const existing = await db.select({ id: accounts.id }).from(accounts).where(eq(accounts.subDomain, subDomain)).limit(1);

  if (existing.length) {
    const accountId = existing[0].id;
    await db.update(accounts).set({ name, dataBase, keyUser, password, logoAddress, active }).where(eq(accounts.id, accountId));
    return accountId;
  }

  await db.insert(accounts).values({ name, subDomain, dataBase, keyUser, password, logoAddress, active });
  const created = await db.select({ id: accounts.id }).from(accounts).where(eq(accounts.subDomain, subDomain)).limit(1);

  return created[0].id;
}

/**
 * Asocia un account con una intance
 * Reemplaza: ensureAccountSupersetLink
 */
async function ensureAccountIntanceLink(accountId, intanceId) {
  const existing = await db
    .select({ id: accountsInstances.id, active: accountsInstances.active })
    .from(accountsInstances)
    .where(and(eq(accountsInstances.accountId, accountId), eq(accountsInstances.instanceId, intanceId)))
    .limit(1);

  if (existing.length) {
    if (!existing[0].active) {
      await db.update(accountsInstances).set({ active: true }).where(eq(accountsInstances.id, existing[0].id));
    }
    return existing[0].id;
  }

  const inserted = await db.insert(accountsInstances).values({
    accountId,
    instanceId: intanceId,
    active: true,
  });

  return inserted?.[0]?.insertId;
}

/**
 * Crea o actualiza un usuario
 * ACTUALIZADO: usa user_name, mail, account_id (nullable para root_admin)
 */
async function ensureUser({ userName, name = null, mail, password, accountId = null, active = true }) {
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.mail, mail)).limit(1);

  if (existing.length) {
    const userId = existing[0].id;
    await db.update(users).set({ userName, name, accountId, active }).where(eq(users.id, userId));
    return userId;
  }

  await db.insert(users).values({
    userName,
    name,
    mail,
    password,
    accountId,
    active,
  });

  const created = await db.select({ id: users.id }).from(users).where(eq(users.mail, mail)).limit(1);

  return created[0].id;
}

/**
 * Crea o actualiza un workspace
 */
async function ensureWorkspace({ name, active = true }) {
  const existing = await db.select({ id: workspaces.id }).from(workspaces).where(eq(workspaces.name, name)).limit(1);

  if (existing.length) {
    const workspaceId = existing[0].id;
    await db.update(workspaces).set({ name, active }).where(eq(workspaces.id, workspaceId));
    return workspaceId;
  }

  await db.insert(workspaces).values({ name, active });
  const created = await db.select({ id: workspaces.id }).from(workspaces).where(eq(workspaces.name, name)).limit(1);

  return created[0].id;
}

/**
 * Habilita un workspace para un account-intance
 * Reemplaza la lógica de ceiling
 */
async function enableWorkspaceForAccountIntance(accountIntanceId, workspaceId) {
  const existing = await db
    .select({ id: accountsInstancesWorkspaces.id, active: accountsInstancesWorkspaces.active })
    .from(accountsInstancesWorkspaces)
    .where(and(eq(accountsInstancesWorkspaces.accountInstanceId, accountIntanceId), eq(accountsInstancesWorkspaces.workspaceId, workspaceId)))
    .limit(1);

  if (existing.length) {
    if (!existing[0].active) {
      await db.update(accountsInstancesWorkspaces).set({ active: true }).where(eq(accountsInstancesWorkspaces.id, existing[0].id));
    }
    return existing[0].id;
  }

  const inserted = await db.insert(accountsInstancesWorkspaces).values({
    accountInstanceId: accountIntanceId,
    workspaceId,
    active: true,
  });

  return inserted?.[0]?.insertId;
}

/**
 * Crea o actualiza un report
 * ACTUALIZADO: ahora pertenece a workspaces_id (no a superset_instance_id)
 */
async function ensureReport({ workspaceId, name, active = true }) {
  const existing = await db
    .select({ id: reports.id })
    .from(reports)
    .where(and(eq(reports.workspaceId, workspaceId), eq(reports.name, name)))
    .limit(1);

  if (existing.length) {
    const reportId = existing[0].id;
    await db.update(reports).set({ name, active }).where(eq(reports.id, reportId));
    return reportId;
  }

  await db.insert(reports).values({
    workspaceId,
    name,
    active,
  });

  const created = await db
    .select({ id: reports.id })
    .from(reports)
    .where(and(eq(reports.workspaceId, workspaceId), eq(reports.name, name)))
    .limit(1);

  return created[0].id;
}

/**
 * Crea o actualiza un dashboard
 * NUEVO: dashboards pertenecen a reports y tienen instance_id + embedded_id
 */
async function ensureDashboard({ reportId, instanceId, embeddedId = null, name, active = true }) {
  const existing = await db
    .select({ id: dashboards.id })
    .from(dashboards)
    .where(and(eq(dashboards.reportId, reportId), eq(dashboards.instanceId, instanceId)))
    .limit(1);

  if (existing.length) {
    const dashboardId = existing[0].id;
    await db.update(dashboards).set({ name, embeddedId, active }).where(eq(dashboards.id, dashboardId));
    return dashboardId;
  }

  await db.insert(dashboards).values({
    reportId,
    instanceId,
    embeddedId,
    name,
    active,
  });

  const created = await db
    .select({ id: dashboards.id })
    .from(dashboards)
    .where(and(eq(dashboards.reportId, reportId), eq(dashboards.instanceId, instanceId)))
    .limit(1);

  return created[0].id;
}

/**
 * Asigna un dashboard a un usuario
 * Reemplaza: assignReportToUser
 */
async function assignDashboardToUser(userId, dashboardId) {
  const existing = await db
    .select({ id: usersDashboards.id, active: usersDashboards.active })
    .from(usersDashboards)
    .where(and(eq(usersDashboards.userId, userId), eq(usersDashboards.dashboardId, dashboardId)))
    .limit(1);

  if (existing.length) {
    if (!existing[0].active) {
      await db.update(usersDashboards).set({ active: true }).where(eq(usersDashboards.id, existing[0].id));
    }
    return existing[0].id;
  }

  const inserted = await db.insert(usersDashboards).values({
    userId,
    dashboardId,
    active: true,
  });

  return inserted?.[0]?.insertId;
}

// ==================== HELPERS DE BÚSQUEDA ====================

async function findAccountByName(name) {
  const result = await db.select({ id: accounts.id }).from(accounts).where(eq(accounts.name, name)).limit(1);
  return result[0] || null;
}

async function findAccountBySubdomain(subDomain) {
  const result = await db.select({ id: accounts.id }).from(accounts).where(eq(accounts.subDomain, subDomain)).limit(1);
  return result[0] || null;
}

async function findIntanceByName(name) {
  const result = await db.select({ id: instances.id }).from(instances).where(eq(instances.name, name)).limit(1);
  return result[0] || null;
}

async function findWorkspaceByName(name) {
  const result = await db.select({ id: workspaces.id }).from(workspaces).where(eq(workspaces.name, name)).limit(1);
  return result[0] || null;
}

async function findReportByName(name) {
  const result = await db.select({ id: reports.id }).from(reports).where(eq(reports.name, name)).limit(1);
  return result[0] || null;
}

async function findDashboardBySupersetId(instanceId) {
  const result = await db.select({ id: dashboards.id }).from(dashboards).where(eq(dashboards.instanceId, instanceId)).limit(1);
  return result[0] || null;
}

module.exports = {
  ROLE_NAMES,
  logger,
  hashPassword,
  checkConnection,
  verifyRoles,
  ensureRole,
  assignRoleToUser,
  ensureIntance,
  ensureAccount,
  ensureAccountIntanceLink,
  ensureUser,
  ensureWorkspace,
  enableWorkspaceForAccountIntance,
  ensureReport,
  ensureDashboard,
  assignDashboardToUser,
  findAccountByName,
  findAccountBySubdomain,
  findIntanceByName,
  findWorkspaceByName,
  findReportByName,
  findDashboardBySupersetId,
};
