const dashboardsRepository = require("./dashboards.repository");
const permissionsService = require("../common/permissions.service");

const { NotFoundError, ForbiddenError } = require("../common/exception");
const { db } = require("../../database");
const { eq, and, isNull } = require("drizzle-orm");
const { dashboards, instances, users } = require("../db/schema");
const { createApacheSuperSetClient } = require("../apache-superset/apache-superset.service");

exports.ensureDashboardEmbeddedId = async (dashboardId) => {
  const rows = await db
    .select({
      id: dashboards.id,
      supersetId: dashboards.supersetId,
      embeddedId: dashboards.embeddedId,
      name: dashboards.name,
      reportId: dashboards.reportId,
      instanceId: instances.id,
      baseUrl: instances.baseUrl,
      apiUserName: instances.apiUserName,
      apiPassword: instances.apiPassword,
    })
    .from(dashboards)
    .innerJoin(
      instances,
      and(eq(instances.id, dashboards.supersetId), eq(instances.active, true), isNull(instances.deletedAt))
    )
    .where(and(eq(dashboards.id, dashboardId), eq(dashboards.active, true), isNull(dashboards.deletedAt)))
    .limit(1);

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

  const client = createApacheSuperSetClient(supersetInstance);

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
  const hasAccess = await permissionsService.validateUserDashboardAccess(userId, dashboardId);
  if (!hasAccess) {
    throw new ForbiddenError("You do not have access to this dashboard");
  }

  const dashboard = await exports.ensureDashboardEmbeddedId(dashboardId);

  const userRows = await db
    .select({
      id: users.id,
      mail: users.mail,
      name: users.name,
      accountId: users.accountsId,
    })
    .from(users)
    .where(and(eq(users.id, userId), eq(users.active, true), isNull(users.deletedAt)))
    .limit(1);

  if (!userRows || userRows.length === 0) {
    throw new NotFoundError("User not found");
  }

  const user = userRows[0];

  const supersetInstance = {
    baseUrl: dashboard.baseUrl,
    apiUserName: dashboard.apiUserName,
    apiPassword: dashboard.apiPassword,
  };

  const client = createApacheSuperSetClient(supersetInstance);

  const { token, dasboardUrl } = await client.generateGuestToken(dashboard.embeddedId);

  let supersetDomain = dasboardUrl || dashboard.baseUrl;
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
