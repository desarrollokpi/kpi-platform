/**
 * Superset Instances Services
 * Business logic for Superset instance management and guest token generation
 */

const { createSupersetClient } = require('./supersetApi.service');
const repository = require('./supersetInstances.repository');

/**
 * Get all Superset instances
 * @returns {Promise<Array>}
 */
exports.getAllSupersetInstances = async () => {
  return await repository.findAll();
};

/**
 * Get all active Superset instances
 * @returns {Promise<Array>}
 */
exports.getActiveSupersetInstances = async () => {
  return await repository.findAllActive();
};

/**
 * Get Superset instance by ID
 * @param {number} id - Instance ID
 * @returns {Promise<Object|null>}
 */
exports.getSupersetInstanceById = async (id) => {
  return await repository.findById(id);
};

/**
 * Create new Superset instance
 * @param {Object} data - Instance data
 * @returns {Promise<Object>}
 */
exports.createSupersetInstance = async (data) => {
  // Validate URL format
  const urlPattern = /^https?:\/\/.+/;
  if (!urlPattern.test(data.baseUrl)) {
    throw new Error('Invalid Superset base URL. Must start with http:// or https://');
  }

  // Test connection to Superset instance
  const client = createSupersetClient({ baseUrl: data.baseUrl });
  const connectionOk = await client.testConnection();

  if (!connectionOk) {
    throw new Error('Failed to connect to Superset instance. Check URL and credentials.');
  }

  const insertId = await repository.create(data);
  return await repository.findById(insertId);
};

/**
 * Update Superset instance
 * @param {number} id - Instance ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>}
 */
exports.updateSupersetInstance = async (id, data) => {
  const instance = await repository.findById(id);

  if (!instance) {
    throw new Error(`Superset instance with id ${id} not found`);
  }

  // If baseUrl is being updated, test connection
  if (data.baseUrl && data.baseUrl !== instance.baseUrl) {
    const client = createSupersetClient({ baseUrl: data.baseUrl });
    const connectionOk = await client.testConnection();

    if (!connectionOk) {
      throw new Error('Failed to connect to new Superset URL. Check URL and credentials.');
    }
  }

  await repository.update(id, data);
  return await repository.findById(id);
};

/**
 * Deactivate Superset instance
 * @param {number} id - Instance ID
 * @returns {Promise<void>}
 */
exports.deactivateSupersetInstance = async (id) => {
  const instance = await repository.findById(id);

  if (!instance) {
    throw new Error(`Superset instance with id ${id} not found`);
  }

  // Check if instance has associated workspaces
  const hasWorkspaces = await repository.hasAssociatedWorkspaces(id);

  if (hasWorkspaces) {
    throw new Error('Cannot delete Superset instance with associated workspaces. Delete workspaces first.');
  }

  await repository.softDelete(id);
};

/**
 * Test connection to Superset instance
 * @param {number} id - Instance ID
 * @returns {Promise<Object>}
 */
exports.testSupersetConnection = async (id) => {
  const instance = await repository.findById(id);

  if (!instance) {
    throw new Error(`Superset instance with id ${id} not found`);
  }

  const client = createSupersetClient(instance);

  try {
    const connected = await client.testConnection();

    if (connected) {
      const userInfo = await client.getCurrentUser();
      return {
        success: true,
        message: 'Connection successful',
        user: userInfo,
      };
    }

    return {
      success: false,
      message: 'Connection failed',
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

/**
 * Generate guest token for embedded dashboard
 *
 * This is the core function for multi-tenant embedded dashboards.
 * It generates a Superset guest token with Row-Level Security (RLS) rules
 * based on the user's tenant.
 *
 * @param {Object} params - Token generation parameters
 * @param {number} params.userId - User ID requesting access
 * @param {string} params.dashboardId - Dashboard UUID in Superset
 * @param {string} params.reportId - Report ID in our system
 * @returns {Promise<Object>} Guest token data
 */
exports.generateGuestToken = async ({ userId, dashboardId, reportId }) => {
  // Get user with account information
  const user = await repository.findUserWithAccount(userId);

  if (!user) {
    throw new Error(`User with id ${userId} not found`);
  }

  if (!user.active) {
    throw new Error('User is inactive');
  }

  // Verify user has access to report
  const hasAccess = await repository.checkUserReportAccess(userId, reportId);

  if (!hasAccess) {
    throw new Error('User does not have access to this report');
  }

  // Get report to find Superset instance
  const report = await repository.findReportById(reportId);

  if (!report) {
    throw new Error(`Report with id ${reportId} not found`);
  }

  if (!report.active) {
    throw new Error('Report is inactive');
  }

  // Verify dashboard ID matches report ID
  if (report.id !== dashboardId) {
    throw new Error('Dashboard ID does not match report');
  }

  // Get Superset instance from workspace
  const workspace = await repository.findWorkspaceForReport(reportId);

  if (!workspace || !workspace.supersetInstanceId) {
    throw new Error('Report does not have an associated Superset instance');
  }

  const instance = await repository.findById(workspace.supersetInstanceId);

  if (!instance) {
    throw new Error('Superset instance not found');
  }

  if (!instance.active) {
    throw new Error('Superset instance is inactive');
  }

  // Build RLS rules for multi-tenant isolation
  const rlsRules = buildRlsRules(user);

  // Generate guest token with RLS
  const client = createSupersetClient(instance);

  const token = await client.generateGuestToken({
    dashboardId,
    user: {
      username: user.username,
      first_name: user.name || user.username,
      last_name: '',
    },
    rls: rlsRules,
  });

  return {
    token,
    supersetDomain: instance.baseUrl,
    dashboardId,
    user: {
      id: user.id,
      username: user.username,
      accountId: user.accountsId,
    },
  };
};

/**
 * Build RLS (Row Level Security) rules for multi-tenant isolation
 *
 * These rules are injected into Superset SQL queries to ensure
 * users only see data for their tenant.
 *
 * @param {Object} user - User object with account information
 * @returns {Array} RLS rules
 *
 * @example
 * // Returns:
 * [
 *   {
 *     clause: "tenant_id = 5"
 *   }
 * ]
 */
function buildRlsRules(user) {
  const rules = [];

  // Primary RLS: Filter by account/tenant ID
  if (user.accountsId) {
    rules.push({
      clause: `tenant_id = ${user.accountsId}`,
    });
  }

  // Additional RLS rules can be added here based on:
  // - User groups
  // - Department
  // - Region
  // - Custom permissions

  return rules;
}

/**
 * Get dashboards from Superset instance
 * @param {number} instanceId - Superset instance ID
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>}
 */
exports.getDashboardsFromSuperset = async (instanceId, params = {}) => {
  const instance = await repository.findById(instanceId);

  if (!instance) {
    throw new Error(`Superset instance with id ${instanceId} not found`);
  }

  const client = createSupersetClient(instance);
  return await client.listDashboards(params);
};

/**
 * Get single dashboard from Superset
 * @param {number} instanceId - Superset instance ID
 * @param {string} dashboardId - Dashboard UUID
 * @returns {Promise<Object>}
 */
exports.getDashboardFromSuperset = async (instanceId, dashboardId) => {
  const instance = await repository.findById(instanceId);

  if (!instance) {
    throw new Error(`Superset instance with id ${instanceId} not found`);
  }

  const client = createSupersetClient(instance);
  return await client.getDashboard(dashboardId);
};

/**
 * Get charts from Superset instance
 * @param {number} instanceId - Superset instance ID
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>}
 */
exports.getChartsFromSuperset = async (instanceId, params = {}) => {
  const instance = await repository.findById(instanceId);

  if (!instance) {
    throw new Error(`Superset instance with id ${instanceId} not found`);
  }

  const client = createSupersetClient(instance);
  return await client.listCharts(params);
};

/**
 * Get databases from Superset instance
 * @param {number} instanceId - Superset instance ID
 * @returns {Promise<Object>}
 */
exports.getDatabasesFromSuperset = async (instanceId) => {
  const instance = await repository.findById(instanceId);

  if (!instance) {
    throw new Error(`Superset instance with id ${instanceId} not found`);
  }

  const client = createSupersetClient(instance);
  return await client.listDatabases();
};
