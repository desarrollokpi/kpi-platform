/**
 * Servicio Centralizado de Permisos
 * Implementa la "Regla de oro" del sistema multi-tenant
 *
 * Regla de oro para acceso a dashboards:
 * Un usuario puede ver un dashboard SOLO si se cumplen TODAS estas condiciones:
 *
 * 1. Usuario:
 *    - users.active = 1
 *    - users.deletedAt IS NULL
 *    - users.accountsId apunta a un accounts activo y no soft-deleted
 *
 * 2. Cadena de dashboard:
 *    - dashboards.active = 1 AND dashboards.deletedAt IS NULL
 *    - reports.active = 1 AND reports.deletedAt IS NULL
 *    - workspaces.active = 1 AND workspaces.deletedAt IS NULL
 *
 * 3. Tenant ↔ instancia ↔ workspace:
 *    - Existe accountsInstances activo con accountsInstances.accountsId = users.accountsId
 *    - Existe accountsInstancesWorkspaces activo vinculando esa accountsInstances con el workspace
 *
 * 4. Asignación usuario-dashboard:
 *    - Existe usersDashboards con idUsers = users.id, dashboardsId = dashboards.id
 *    - usersDashboards.active = 1
 *    - usersDashboards.deletedAt IS NULL
 *
 * Root Admin:
 * - Puede ver cualquier dashboard sin restricciones de tenant
 * - Aún así respeta active y deletedAt
 */

const { db } = require("../../database");
const { sql, eq, and, isNull } = require("drizzle-orm");
const { users, accounts, dashboards, reports, workspaces, usersDashboards, accountsInstances, accountsInstancesWorkspaces } = require("../db/schema");
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
    // Obtener usuario con roles
    const [userRows] = await db.execute(sql`
      SELECT
        u.id,
        u.accounts_id as accountsId,
        u.active as userActive,
        u.deleted_at as userDeletedAt,
        a.active as accountActive,
        a.deleted_at as accountDeletedAt,
        JSON_ARRAYAGG(r.name) as roles
      FROM users u
      LEFT JOIN accounts a ON u.accounts_id = a.id
      LEFT JOIN users_roles ur ON u.id = ur.users_id
        AND ur.active = 1
        AND ur.deleted_at IS NULL
      LEFT JOIN roles r ON ur.roles_id = r.id
        AND r.active = 1
        AND r.deleted_at IS NULL
      WHERE u.id = ${userId}
      GROUP BY u.id
    `);

    if (!userRows || userRows.length === 0) {
      return false;
    }

    const user = userRows[0];

    // 1. Validar usuario activo y no deleted
    if (!user.userActive || user.userDeletedAt) {
      return false;
    }

    // Si es root_admin, puede ver cualquier dashboard (respetando active/deletedAt)
    const roles = user.roles ? JSON.parse(user.roles) : [];
    const isRootAdmin = roles.includes(ROLE_NAMES.ROOT_ADMIN);

    if (isRootAdmin) {
      // Root admin solo valida que el dashboard esté activo y no deleted
      const [dashboardRows] = await db.execute(sql`
        SELECT 1
        FROM dashboards d
        INNER JOIN reports r ON d.reports_id = r.id
          AND r.active = 1 AND r.deleted_at IS NULL
        INNER JOIN workspaces w ON r.workspaces_id = w.id
          AND w.active = 1 AND w.deleted_at IS NULL
        WHERE d.id = ${dashboardId}
          AND d.active = 1 AND d.deleted_at IS NULL
      `);
      return dashboardRows && dashboardRows.length > 0;
    }

    // Para tenant users/admins: validar cuenta activa
    if (!user.accountsId || !user.accountActive || user.accountDeletedAt) {
      return false;
    }

    // 2-4. Validar toda la cadena (Regla de oro)
    const [accessRows] = await db.execute(sql`
      SELECT 1
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
        AND d.id = ${dashboardId}
        AND ai.accounts_id = ${user.accountsId}
      LIMIT 1
    `);

    return accessRows && accessRows.length > 0;
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
    // Obtener usuario con roles
    const [userRows] = await db.execute(sql`
      SELECT
        u.id,
        u.accounts_id as accountsId,
        u.active as userActive,
        u.deleted_at as userDeletedAt,
        a.active as accountActive,
        a.deleted_at as accountDeletedAt,
        JSON_ARRAYAGG(r.name) as roles
      FROM users u
      LEFT JOIN accounts a ON u.accounts_id = a.id
      LEFT JOIN users_roles ur ON u.id = ur.users_id
        AND ur.active = 1
        AND ur.deleted_at IS NULL
      LEFT JOIN roles r ON ur.roles_id = r.id
        AND r.active = 1
        AND r.deleted_at IS NULL
      WHERE u.id = ${userId}
      GROUP BY u.id
    `);

    if (!userRows || userRows.length === 0) {
      return [];
    }

    const user = userRows[0];

    // Validar usuario activo
    if (!user.userActive || user.userDeletedAt) {
      return [];
    }

    const roles = user.roles ? JSON.parse(user.roles) : [];
    const isRootAdmin = roles.includes(ROLE_NAMES.ROOT_ADMIN);

    // Root Admin: Ver todos los dashboards activos
    if (isRootAdmin) {
      const [dashboardRows] = await db.execute(sql`
        SELECT DISTINCT
          d.id,
          d.superset_id as supersetId,
          d.embedded_id as embeddedId,
          d.name,
          d.reports_id as reportsId,
          r.name as reportName,
          r.workspaces_id as workspacesId,
          w.name as workspaceName,
          d.active,
          d.created_at as createdAt,
          d.updated_at as updatedAt
        FROM dashboards d
        INNER JOIN reports r ON r.id = d.reports_id
          AND r.active = 1 AND r.deleted_at IS NULL
        INNER JOIN workspaces w ON w.id = r.workspaces_id
          AND w.active = 1 AND w.deleted_at IS NULL
        WHERE d.active = 1 AND d.deleted_at IS NULL
        ORDER BY w.name, r.name, d.name
      `);
      return dashboardRows || [];
    }

    // Tenant users/admins: Validar cuenta activa
    if (!user.accountsId || !user.accountActive || user.accountDeletedAt) {
      return [];
    }

    // Aplicar Regla de oro completa
    const [dashboardRows] = await db.execute(sql`
      SELECT DISTINCT
        d.id,
        d.superset_id as supersetId,
        d.embedded_id as embeddedId,
        d.name,
        d.reports_id as reportsId,
        r.name as reportName,
        r.workspaces_id as workspacesId,
        w.name as workspaceName,
        i.id as intanceId,
        i.name as intanceName,
        i.base_url as intanceBaseUrl,
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
      INNER JOIN instances i ON i.id = ai.instances_id
        AND i.active = 1 AND i.deleted_at IS NULL
      WHERE u.id = ${userId}
        AND ai.accounts_id = ${user.accountsId}
        AND u.active = 1 AND u.deleted_at IS NULL
      ORDER BY w.name, r.name, d.name
    `);

    return dashboardRows || [];
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
    const [userRows] = await db.execute(sql`
      SELECT
        u.accounts_id as accountsId,
        JSON_ARRAYAGG(r.name) as roles
      FROM users u
      LEFT JOIN users_roles ur ON u.id = ur.users_id
        AND ur.active = 1
        AND ur.deleted_at IS NULL
      LEFT JOIN roles r ON ur.roles_id = r.id
        AND r.active = 1
        AND r.deleted_at IS NULL
      WHERE u.id = ${userId}
        AND u.active = 1
        AND u.deleted_at IS NULL
      GROUP BY u.id
    `);

    if (!userRows || userRows.length === 0) {
      return false;
    }

    const user = userRows[0];
    const roles = user.roles ? JSON.parse(user.roles) : [];

    // Root admin tiene acceso a todos los tenants
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
    // 1. Validar que Tenant Admin y target user pertenecen al mismo tenant
    const [adminRows] = await db.execute(sql`
      SELECT accounts_id as accountsId
      FROM users
      WHERE id = ${tenantAdminId}
        AND active = 1
        AND deleted_at IS NULL
    `);

    const [targetRows] = await db.execute(sql`
      SELECT accounts_id as accountsId
      FROM users
      WHERE id = ${targetUserId}
        AND active = 1
        AND deleted_at IS NULL
    `);

    if (!adminRows || !targetRows || adminRows.length === 0 || targetRows.length === 0) {
      return false;
    }

    const adminAccountId = adminRows[0].accountsId;
    const targetAccountId = targetRows[0].accountsId;

    if (!adminAccountId || !targetAccountId || adminAccountId !== targetAccountId) {
      return false;
    }

    // 2. Validar que el dashboard está en un workspace habilitado para ese tenant
    const [dashboardRows] = await db.execute(sql`
      SELECT 1
      FROM dashboards d
      INNER JOIN reports r ON r.id = d.reports_id
        AND r.active = 1 AND r.deleted_at IS NULL
      INNER JOIN workspaces w ON w.id = r.workspaces_id
        AND w.active = 1 AND w.deleted_at IS NULL
      INNER JOIN accounts_instances_workspaces aiw ON aiw.id_workspaces = w.id
        AND aiw.active = 1 AND aiw.deleted_at IS NULL
      INNER JOIN accounts_instances ai ON ai.id = aiw.id_accounts_instances
        AND ai.active = 1 AND ai.deleted_at IS NULL
      WHERE d.id = ${dashboardId}
        AND d.active = 1 AND d.deleted_at IS NULL
        AND ai.accounts_id = ${adminAccountId}
      LIMIT 1
    `);

    return dashboardRows && dashboardRows.length > 0;
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
    const [rows] = await db.execute(sql`
      SELECT r.name
      FROM users_roles ur
      INNER JOIN roles r ON r.id = ur.roles_id
        AND r.active = 1 AND r.deleted_at IS NULL
      WHERE ur.users_id = ${userId}
        AND ur.active = 1 AND ur.deleted_at IS NULL
    `);

    return rows ? rows.map(row => row.name) : [];
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