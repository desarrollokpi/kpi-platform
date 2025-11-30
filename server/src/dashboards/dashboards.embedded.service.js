const dashboardsRepository = require("./dashboards.repository");
const permissionsService = require("../common/permissions.service");

const { NotFoundError, ForbiddenError } = require("../common/exception");
const { createApacheSuperSetClient } = require("../integrations/apache-superset.service");

exports.ensureDashboardEmbeddedId = async (dashboardId) => {
  const dashboard = await dashboardsRepository.getDashboardEmbedInfo(dashboardId);

  if (!dashboard) {
    throw new NotFoundError("Dashboard not found or not accessible");
  }

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

  const embeddedConfig = await client.enableEmbeddedDashboard(dashboard.instanceId.toString());

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

  const user = await dashboardsRepository.findActiveUserById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

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
