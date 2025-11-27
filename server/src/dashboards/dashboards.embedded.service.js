const dashboardsRepository = require("./dashboards.repository");
const permissionsService = require("../common/permissions.service");
const { createSupersetClient } = require("../supersetInstances/supersetApi.service");
const { NotFoundError, ForbiddenError } = require("../common/exception");
const { db } = require("../../database");
const { sql } = require("drizzle-orm");

exports.ensureDashboardEmbeddedId = async (dashboardId) => {
  // Obtener dashboard con información de la instancia de Superset
  const [rows] = await db.execute(sql`
    SELECT
      d.id,
      d.superset_id as supersetId,
      d.embedded_id as embeddedId,
      d.name,
      d.reports_id as reportsId,
      r.workspaces_id as workspacesId,
      i.id as instanceId,
      i.base_url as baseUrl,
      i.api_user_name as apiUserName,
      i.api_password as apiPassword
    FROM dashboards d
    INNER JOIN reports r ON r.id = d.reports_id
    INNER JOIN workspaces w ON w.id = r.workspaces_id
    INNER JOIN accounts_instances_workspaces aiw ON aiw.id_workspaces = w.id
      AND aiw.active = 1 AND aiw.deleted_at IS NULL
    INNER JOIN accounts_instances ai ON ai.id = aiw.id_accounts_instances
      AND ai.active = 1 AND ai.deleted_at IS NULL
    INNER JOIN instances i ON i.id = ai.instances_id
      AND i.active = 1 AND i.deleted_at IS NULL
    WHERE d.id = ${dashboardId}
      AND d.active = 1 AND d.deleted_at IS NULL
    LIMIT 1
  `);

  if (!rows || rows.length === 0) {
    throw new NotFoundError("Dashboard not found or not accessible");
  }

  const dashboard = rows[0];

  // Si ya tiene embeddedId, retornar
  if (dashboard.embeddedId) {
    return dashboard;
  }

  // Habilitar embedded en Superset y obtener UUID
  const supersetInstance = {
    baseUrl: dashboard.baseUrl,
    apiUserName: dashboard.apiUserName,
    apiPassword: dashboard.apiPassword,
  };

  const client = createSupersetClient(supersetInstance);

  // Habilitar embedded dashboard en Superset
  const embeddedConfig = await client.enableEmbeddedDashboard(dashboard.supersetId.toString());

  // Guardar embeddedId (UUID) en la base de datos
  await dashboardsRepository.updateDashboard(dashboardId, {
    embeddedId: embeddedConfig.uuid,
  });

  // Retornar dashboard actualizado
  dashboard.embeddedId = embeddedConfig.uuid;
  return dashboard;
};

exports.getDashboardEmbeddedConfig = async (dashboardId, userId) => {
  // Validar permisos usando "Regla de oro"
  const hasAccess = await permissionsService.validateUserDashboardAccess(userId, dashboardId);
  if (!hasAccess) {
    throw new ForbiddenError("You do not have access to this dashboard");
  }

  // Asegurar que el dashboard tenga embeddedId
  const dashboard = await exports.ensureDashboardEmbeddedId(dashboardId);

  // Obtener información del usuario para el guest token
  const [userRows] = await db.execute(sql`
    SELECT
      u.id,
      u.mail,
      u.firstName,
      u.lastName,
      u.accounts_id as accountId
    FROM users u
    WHERE u.id = ${userId}
      AND u.active = 1 AND u.deleted_at IS NULL
    LIMIT 1
  `);

  if (!userRows || userRows.length === 0) {
    throw new NotFoundError("User not found");
  }

  const user = userRows[0];

  // Crear cliente de Superset
  const supersetInstance = {
    baseUrl: dashboard.baseUrl,
    apiUserName: dashboard.apiUserName,
    apiPassword: dashboard.apiPassword,
  };

  const client = createSupersetClient(supersetInstance);

  // Generar guest token
  // RLS (Row Level Security) puede agregarse aquí si se necesita filtrado por tenant
  const rls = [
    // Ejemplo: { clause: `tenant_id = ${user.accountId}` }
  ];

  const token = await client.generateGuestToken({
    dashboardId: dashboard.embeddedId,
    user: {
      username: user.mail || `user_${user.id}`,
      first_name: user.firstName || "User",
      last_name: user.lastName || "",
    },
    rls,
  });

  // Normalizar supersetDomain para frontend
  let supersetDomain = dashboard.baseUrl;
  if (supersetDomain.includes("host.docker.internal")) {
    supersetDomain = supersetDomain.replace("host.docker.internal", "localhost");
  }

  return {
    token,
    dashboardId: dashboard.embeddedId, // Este es el UUID de Superset para embedding
    supersetDomain,
    dashboardName: dashboard.name,
  };
};

module.exports = exports;
