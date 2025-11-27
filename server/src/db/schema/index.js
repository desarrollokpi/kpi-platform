/**
 * Schema Index - Exporta todos los schemas del modelo EER final
 *
 * MODELO ACTUALIZADO:
 * - accounts + accountContract
 * - users + roles + usersRoles
 * - instances (instancias Superset) + accountsInstances
 * - workspaces + accountsInstancesWorkspaces
 * - reports + dashboards + usersDashboards
 *
 * ELIMINADO (modelo anterior):
 * - superset_instances → reemplazado por instances
 * - accounts_superset_instances → reemplazado por accountsInstances
 * - accounts_reports_ceiling/floor → eliminado (permisos viejos)
 * - users_reports → reemplazado por usersDashboards
 */

module.exports = {
  ...require("./accounts"),
  ...require("./users"),
  ...require("./roles"),
  ...require("./instances"),
  ...require("./workspaces"),
  ...require("./reports"),
  ...require("./dashboards"),
  // Views are loaded directly by Drizzle from views.js
  // ...require("./views"),
};
