const { db } = require("../../database");
const { eq, and, isNull } = require("drizzle-orm");
const {
  users,
  accounts,
  dashboards,
  reports,
  workspaces,
  usersDashboards,
  accountsInstances,
  accountsInstancesWorkspaces,
  instances,
  roles,
  usersRoles,
} = require("../db/schema");
const { ROLE_NAMES } = require("../constants/roles");

/**
 * Valida si un usuario tiene acceso a un dashboard específico
 * Aplica la "Regla de oro" completa
 *
 * @param {number} userId - ID del usuario
 * @param {number} dashboardId - ID del dashboard
 * @returns {Promise<boolean>} true si tiene acceso, false en caso contrario
 */
exports.validateUserDashboardAccess = async (userId, dashboardId) => {
  try {
    const userRows = await db
      .select({
        id: users.id,
        accountsId: users.accountsId,
        userActive: users.active,
        userDeletedAt: users.deletedAt,
        accountActive: accounts.active,
        accountDeletedAt: accounts.deletedAt,
      })
      .from(users)
      .leftJoin(accounts, eq(users.accountsId, accounts.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (!userRows || userRows.length === 0) {
      return false;
    }

    const user = userRows[0];

    if (!user.userActive || user.userDeletedAt) {
      return false;
    }

    const userRoles = await exports.getUserRoles(userId);
    const isRootAdmin = userRoles.includes(ROLE_NAMES.ROOT_ADMIN);
    const isTenantAdmin = userRoles.includes(ROLE_NAMES.TENANT_ADMIN);

    if (isRootAdmin) {
      const rows = await db
        .select({ id: dashboards.id })
        .from(dashboards)
        .innerJoin(reports, and(eq(dashboards.reportId, reports.id), eq(reports.active, true), isNull(reports.deletedAt)))
        .innerJoin(workspaces, and(eq(reports.workspacesId, workspaces.id), eq(workspaces.active, true), isNull(workspaces.deletedAt)))
        .where(and(eq(dashboards.id, dashboardId), eq(dashboards.active, true), isNull(dashboards.deletedAt)))
        .limit(1);

      return rows.length > 0;
    }

    if (!user.accountsId || !user.accountActive || user.accountDeletedAt) {
      return false;
    }

    // Tenant admins: can access any dashboard within their tenant
    if (isTenantAdmin) {
      const tenantRows = await db
        .select({ id: dashboards.id })
        .from(dashboards)
        .innerJoin(reports, and(eq(dashboards.reportId, reports.id), eq(reports.active, true), isNull(reports.deletedAt)))
        .innerJoin(workspaces, and(eq(reports.workspacesId, workspaces.id), eq(workspaces.active, true), isNull(workspaces.deletedAt)))
        .innerJoin(
          accountsInstancesWorkspaces,
          and(
            eq(accountsInstancesWorkspaces.idWorkspaces, workspaces.id),
            eq(accountsInstancesWorkspaces.active, true),
            isNull(accountsInstancesWorkspaces.deletedAt)
          )
        )
        .innerJoin(
          accountsInstances,
          and(
            eq(accountsInstances.id, accountsInstancesWorkspaces.idAccountsInstances),
            eq(accountsInstances.active, true),
            isNull(accountsInstances.deletedAt),
            eq(accountsInstances.accountsId, user.accountsId)
          )
        )
        .where(and(eq(dashboards.id, dashboardId), eq(dashboards.active, true), isNull(dashboards.deletedAt)))
        .limit(1);

      return tenantRows.length > 0;
    }

    // Regular tenant users: must have explicit assignment via usersDashboards
    const accessRows = await db
      .select({ id: dashboards.id })
      .from(users)
      .innerJoin(usersDashboards, and(eq(usersDashboards.idUsers, users.id), eq(usersDashboards.active, true), isNull(usersDashboards.deletedAt)))
      .innerJoin(dashboards, and(eq(usersDashboards.dashboardsId, dashboards.id), eq(dashboards.active, true), isNull(dashboards.deletedAt)))
      .innerJoin(reports, and(eq(dashboards.reportId, reports.id), eq(reports.active, true), isNull(reports.deletedAt)))
      .innerJoin(workspaces, and(eq(reports.workspacesId, workspaces.id), eq(workspaces.active, true), isNull(workspaces.deletedAt)))
      .innerJoin(
        accountsInstancesWorkspaces,
        and(
          eq(accountsInstancesWorkspaces.idWorkspaces, workspaces.id),
          eq(accountsInstancesWorkspaces.active, true),
          isNull(accountsInstancesWorkspaces.deletedAt)
        )
      )
      .innerJoin(
        accountsInstances,
        and(eq(accountsInstances.id, accountsInstancesWorkspaces.idAccountsInstances), eq(accountsInstances.active, true), isNull(accountsInstances.deletedAt))
      )
      .where(and(eq(users.id, userId), eq(dashboards.id, dashboardId), eq(accountsInstances.accountsId, user.accountsId)))
      .limit(1);

    return accessRows.length > 0;
  } catch (error) {
    console.error("Error validating user dashboard access:", error);
    return false;
  }
};

/**
 * Obtiene todos los dashboards accesibles para un usuario
 * Aplica la "Regla de oro"
 *
 * @param {number} userId - ID del usuario
 * @returns {Promise<Array>} Array de dashboards con información completa
 */
exports.getUserAccessibleDashboards = async (userId) => {
  try {
    const userRows = await db
      .select({
        id: users.id,
        accountsId: users.accountsId,
        userActive: users.active,
        userDeletedAt: users.deletedAt,
        accountActive: accounts.active,
        accountDeletedAt: accounts.deletedAt,
      })
      .from(users)
      .leftJoin(accounts, eq(users.accountsId, accounts.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (!userRows || userRows.length === 0) {
      return [];
    }

    const user = userRows[0];

    if (!user.userActive || user.userDeletedAt) {
      return [];
    }

    const userRoles = await exports.getUserRoles(userId);
    const isRootAdmin = userRoles.includes(ROLE_NAMES.ROOT_ADMIN);
    const isTenantAdmin = userRoles.includes(ROLE_NAMES.TENANT_ADMIN);

    if (isRootAdmin) {
      const dashboardRows = await db
        .select({
          id: dashboards.id,
          supersetId: dashboards.supersetId,
          embeddedId: dashboards.embeddedId,
          name: dashboards.name,
          reportsId: dashboards.reportId,
          reportName: reports.name,
          workspacesId: reports.workspacesId,
          workspaceName: workspaces.name,
          active: dashboards.active,
          createdAt: dashboards.createdAt,
          updatedAt: dashboards.updatedAt,
        })
        .from(dashboards)
        .innerJoin(reports, and(eq(dashboards.reportId, reports.id), eq(reports.active, true), isNull(reports.deletedAt)))
        .innerJoin(workspaces, and(eq(reports.workspacesId, workspaces.id), eq(workspaces.active, true), isNull(workspaces.deletedAt)))
        .where(and(eq(dashboards.active, true), isNull(dashboards.deletedAt)));

      return dashboardRows;
    }

    if (!user.accountsId || !user.accountActive || user.accountDeletedAt) {
      return [];
    }

    // Tenant admins: all dashboards within their tenant
    if (isTenantAdmin) {
      const dashboardRows = await db
        .select({
          id: dashboards.id,
          supersetId: dashboards.supersetId,
          embeddedId: dashboards.embeddedId,
          name: dashboards.name,
          reportsId: dashboards.reportId,
          reportName: reports.name,
          workspacesId: reports.workspacesId,
          workspaceName: workspaces.name,
          instanceId: instances.id,
          instanceName: instances.name,
          instanceBaseUrl: instances.baseUrl,
          active: dashboards.active,
          createdAt: dashboards.createdAt,
          updatedAt: dashboards.updatedAt,
        })
        .from(dashboards)
        .innerJoin(reports, and(eq(dashboards.reportId, reports.id), eq(reports.active, true), isNull(reports.deletedAt)))
        .innerJoin(workspaces, and(eq(reports.workspacesId, workspaces.id), eq(workspaces.active, true), isNull(workspaces.deletedAt)))
        .innerJoin(
          accountsInstancesWorkspaces,
          and(
            eq(accountsInstancesWorkspaces.idWorkspaces, workspaces.id),
            eq(accountsInstancesWorkspaces.active, true),
            isNull(accountsInstancesWorkspaces.deletedAt)
          )
        )
        .innerJoin(
          accountsInstances,
          and(
            eq(accountsInstances.id, accountsInstancesWorkspaces.idAccountsInstances),
            eq(accountsInstances.active, true),
            isNull(accountsInstances.deletedAt),
            eq(accountsInstances.accountsId, user.accountsId)
          )
        )
        .innerJoin(instances, and(eq(instances.id, accountsInstances.instancesId), eq(instances.active, true), isNull(instances.deletedAt)))
        .where(and(eq(dashboards.active, true), isNull(dashboards.deletedAt)));

      return dashboardRows;
    }

    // Regular tenant users: dashboards explicitly assigned to them within their tenant
    const dashboardRows = await db
      .select({
        id: dashboards.id,
        supersetId: dashboards.supersetId,
        embeddedId: dashboards.embeddedId,
        name: dashboards.name,
        reportsId: dashboards.reportId,
        reportName: reports.name,
        workspacesId: reports.workspacesId,
        workspaceName: workspaces.name,
        instanceId: instances.id,
        instanceName: instances.name,
        instanceBaseUrl: instances.baseUrl,
        active: dashboards.active,
        createdAt: dashboards.createdAt,
        updatedAt: dashboards.updatedAt,
      })
      .from(users)
      .innerJoin(usersDashboards, and(eq(usersDashboards.idUsers, users.id), eq(usersDashboards.active, true), isNull(usersDashboards.deletedAt)))
      .innerJoin(dashboards, and(eq(usersDashboards.dashboardsId, dashboards.id), eq(dashboards.active, true), isNull(dashboards.deletedAt)))
      .innerJoin(reports, and(eq(dashboards.reportId, reports.id), eq(reports.active, true), isNull(reports.deletedAt)))
      .innerJoin(workspaces, and(eq(reports.workspacesId, workspaces.id), eq(workspaces.active, true), isNull(workspaces.deletedAt)))
      .innerJoin(
        accountsInstancesWorkspaces,
        and(
          eq(accountsInstancesWorkspaces.idWorkspaces, workspaces.id),
          eq(accountsInstancesWorkspaces.active, true),
          isNull(accountsInstancesWorkspaces.deletedAt)
        )
      )
      .innerJoin(
        accountsInstances,
        and(eq(accountsInstances.id, accountsInstancesWorkspaces.idAccountsInstances), eq(accountsInstances.active, true), isNull(accountsInstances.deletedAt))
      )
      .innerJoin(instances, and(eq(instances.id, accountsInstances.instancesId), eq(instances.active, true), isNull(instances.deletedAt)))
      .where(and(eq(users.id, userId), eq(users.active, true), isNull(users.deletedAt), eq(accountsInstances.accountsId, user.accountsId)));

    return dashboardRows;
  } catch (error) {
    console.error("Error getting user accessible dashboards:", error);
    return [];
  }
};

/**
 * Valida que un usuario pertenece al mismo tenant que un recurso
 * Usado por Tenant Admin para verificar scope
 *
 * @param {number} userId - ID del usuario que realiza la operación
 * @param {number} targetAccountId - ID del tenant del recurso objetivo
 * @returns {Promise<boolean>} true si pertenece al mismo tenant o es root_admin
 */
exports.validateTenantScope = async (userId, targetAccountId) => {
  try {
    const userRows = await db
      .select({
        accountsId: users.accountsId,
      })
      .from(users)
      .where(and(eq(users.id, userId), eq(users.active, true), isNull(users.deletedAt)))
      .limit(1);

    if (!userRows || userRows.length === 0) {
      return false;
    }

    const user = userRows[0];
    const roles = await exports.getUserRoles(userId);

    if (roles.includes(ROLE_NAMES.ROOT_ADMIN)) {
      return true;
    }

    // Validar mismo tenant
    return user.accountsId === targetAccountId;
  } catch (error) {
    console.error("Error validating tenant scope:", error);
    return false;
  }
};

/**
 * Valida que se puede asignar un rol a un usuario
 * Reglas:
 * - root_admin SOLO puede tener accountsId = NULL
 * - tenant_admin/tenant_user DEBEN tener accountsId válido
 *
 * @param {string} roleName - Nombre del rol a asignar
 * @param {number|null} userAccountsId - accountsId del usuario
 * @throws {Error} Si la asignación viola las reglas
 */
exports.validateRoleAssignment = (roleName, userAccountsId) => {
  if (roleName === ROLE_NAMES.ROOT_ADMIN && userAccountsId !== null) {
    throw new Error("root_admin role can only be assigned to users with accountsId = NULL");
  }

  if ((roleName === ROLE_NAMES.TENANT_ADMIN || roleName === ROLE_NAMES.TENANT_USER) && !userAccountsId) {
    throw new Error(`${roleName} role requires a valid accountsId (cannot be NULL)`);
  }
};

/**
 * Valida si un Tenant Admin puede asignar un dashboard a un usuario
 * Reglas:
 * - Usuario debe pertenecer al mismo tenant
 * - Dashboard debe estar en un workspace habilitado para ese tenant
 * - Workspace debe estar vinculado a una instancia asociada al tenant
 *
 * @param {number} tenantAdminId - ID del Tenant Admin
 * @param {number} targetUserId - ID del usuario objetivo
 * @param {number} dashboardId - ID del dashboard
 * @returns {Promise<boolean>} true si puede asignar
 */
exports.canAssignDashboard = async (tenantAdminId, targetUserId, dashboardId) => {
  try {
    const adminRows = await db
      .select({ accountsId: users.accountsId })
      .from(users)
      .where(and(eq(users.id, tenantAdminId), eq(users.active, true), isNull(users.deletedAt)))
      .limit(1);

    const targetRows = await db
      .select({ accountsId: users.accountsId })
      .from(users)
      .where(and(eq(users.id, targetUserId), eq(users.active, true), isNull(users.deletedAt)))
      .limit(1);

    if (!adminRows.length || !targetRows.length) {
      return false;
    }

    const adminAccountId = adminRows[0].accountsId;
    const targetAccountId = targetRows[0].accountsId;

    if (!adminAccountId || !targetAccountId || adminAccountId !== targetAccountId) {
      return false;
    }

    const dashboardRows = await db
      .select({ id: dashboards.id })
      .from(dashboards)
      .innerJoin(reports, and(eq(dashboards.reportId, reports.id), eq(reports.active, true), isNull(reports.deletedAt)))
      .innerJoin(workspaces, and(eq(reports.workspacesId, workspaces.id), eq(workspaces.active, true), isNull(workspaces.deletedAt)))
      .innerJoin(
        accountsInstancesWorkspaces,
        and(
          eq(accountsInstancesWorkspaces.idWorkspaces, workspaces.id),
          eq(accountsInstancesWorkspaces.active, true),
          isNull(accountsInstancesWorkspaces.deletedAt)
        )
      )
      .innerJoin(
        accountsInstances,
        and(eq(accountsInstances.id, accountsInstancesWorkspaces.idAccountsInstances), eq(accountsInstances.active, true), isNull(accountsInstances.deletedAt))
      )
      .where(and(eq(dashboards.id, dashboardId), eq(dashboards.active, true), isNull(dashboards.deletedAt), eq(accountsInstances.accountsId, adminAccountId)))
      .limit(1);

    return dashboardRows.length > 0;
  } catch (error) {
    console.error("Error validating dashboard assignment permission:", error);
    return false;
  }
};

/**
 * Obtiene los roles de un usuario
 *
 * @param {number} userId - ID del usuario
 * @returns {Promise<Array<string>>} Array de nombres de roles
 */
exports.getUserRoles = async (userId) => {
  try {
    const rows = await db
      .select({
        name: roles.name,
      })
      .from(usersRoles)
      .innerJoin(roles, and(eq(usersRoles.rolesId, roles.id), eq(roles.active, true), isNull(roles.deletedAt)))
      .where(and(eq(usersRoles.usersId, userId), eq(usersRoles.active, true), isNull(usersRoles.deletedAt)));

    return rows.map((row) => row.name);
  } catch (error) {
    console.error("Error getting user roles:", error);
    return [];
  }
};

/**
 * Verifica si un usuario tiene un rol específico
 *
 * @param {number} userId - ID del usuario
 * @param {string} roleName - Nombre del rol
 * @returns {Promise<boolean>} true si tiene el rol
 */
exports.userHasRole = async (userId, roleName) => {
  const roles = await exports.getUserRoles(userId);
  return roles.includes(roleName);
};

/**
 * Verifica si un usuario es Root Admin
 *
 * @param {number} userId - ID del usuario
 * @returns {Promise<boolean>} true si es root_admin
 */
exports.isRootAdmin = async (userId) => {
  return await exports.userHasRole(userId, ROLE_NAMES.ROOT_ADMIN);
};

/**
 * Verifica si un usuario es Tenant Admin
 *
 * @param {number} userId - ID del usuario
 * @returns {Promise<boolean>} true si es tenant_admin
 */
exports.isTenantAdmin = async (userId) => {
  return await exports.userHasRole(userId, ROLE_NAMES.TENANT_ADMIN);
};

module.exports = exports;
