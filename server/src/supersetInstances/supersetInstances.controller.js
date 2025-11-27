/**
 * Superset Instances Controller
 * Handles HTTP requests for Superset instance management
 * Root Admin only
 */

const services = require('./supersetInstances.services');
const validators = require('../common/validators');

/**
 * GET /api/superset-instances
 * Get all Superset instances
 */
exports.getAllSupersetInstances = async (req, res) => {
  try {
    const instances = await services.getAllSupersetInstances();
    res.json(instances);
  } catch (error) {
    console.error('Error fetching Superset instances:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/superset-instances/active
 * Get all active Superset instances
 */
exports.getActiveSupersetInstances = async (req, res) => {
  try {
    const instances = await services.getActiveSupersetInstances();
    res.json(instances);
  } catch (error) {
    console.error('Error fetching active Superset instances:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/superset-instances/:id
 * Get Superset instance by ID
 */
exports.getSupersetInstanceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validators.isValidId(id)) {
      return res.status(400).json({ error: 'Invalid instance ID' });
    }

    const instance = await services.getSupersetInstanceById(id);

    if (!instance) {
      return res.status(404).json({ error: 'Superset instance not found' });
    }

    res.json(instance);
  } catch (error) {
    console.error('Error fetching Superset instance:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/superset-instances
 * Create a new Superset instance
 */
exports.createSupersetInstance = async (req, res) => {
  try {
    const { name, baseUrl, active } = req.body;

    // Validate input
    const validation = validators.validateSupersetInstance({ name, baseUrl, active });
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const result = await services.createSupersetInstance({ name, baseUrl, active });
    res.status(201).json({ message: 'Superset instance created successfully', result });
  } catch (error) {
    console.error('Error creating Superset instance:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * PUT /api/superset-instances/:id
 * Update Superset instance
 */
exports.updateSupersetInstance = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, baseUrl, active } = req.body;

    if (!validators.isValidId(id)) {
      return res.status(400).json({ error: 'Invalid instance ID' });
    }

    // Validate input
    const validation = validators.validateSupersetInstance({ name, baseUrl, active });
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const result = await services.updateSupersetInstance(id, { name, baseUrl, active });
    res.json({ message: 'Superset instance updated successfully', result });
  } catch (error) {
    console.error('Error updating Superset instance:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * DELETE /api/superset-instances/:id
 * Deactivate Superset instance
 */
exports.deactivateSupersetInstance = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validators.isValidId(id)) {
      return res.status(400).json({ error: 'Invalid instance ID' });
    }

    const result = await services.deactivateSupersetInstance(id);
    res.json({ message: 'Superset instance deactivated successfully', result });
  } catch (error) {
    console.error('Error deactivating Superset instance:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/superset-instances/:id/test-connection
 * Test connection to Superset instance
 */
exports.testConnection = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validators.isValidId(id)) {
      return res.status(400).json({ error: 'Invalid instance ID' });
    }

    const result = await services.testSupersetConnection(id);
    res.json(result);
  } catch (error) {
    console.error('Error testing Superset connection:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/superset-instances/generate-guest-token
 * Generate guest token for embedded dashboard
 *
 * Body:
 * - dashboardId: Dashboard UUID in Superset
 * - reportId: Report ID in our system
 */
exports.generateGuestToken = async (req, res) => {
  try {
    const { dashboardId, reportId } = req.body;
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!dashboardId) {
      return res.status(400).json({ error: 'dashboardId is required' });
    }

    if (!reportId) {
      return res.status(400).json({ error: 'reportId is required' });
    }

    const result = await services.generateGuestToken({
      userId,
      dashboardId,
      reportId,
    });

    res.json(result);
  } catch (error) {
    console.error('Error generating guest token:', error);

    const statusCode = error.message.includes('not found') ? 404
      : error.message.includes('does not have access') ? 403
      : error.message.includes('inactive') ? 403
      : 500;

    res.status(statusCode).json({ error: error.message });
  }
};

/**
 * GET /api/superset-instances/:id/dashboards
 * Get dashboards from Superset instance
 */
exports.getDashboards = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 0, pageSize = 20 } = req.query;

    if (!validators.isValidId(id)) {
      return res.status(400).json({ error: 'Invalid instance ID' });
    }

    const result = await services.getDashboardsFromSuperset(id, {
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching dashboards:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/superset-instances/:id/dashboards/:dashboardId
 * Get single dashboard from Superset instance
 */
exports.getDashboard = async (req, res) => {
  try {
    const { id, dashboardId } = req.params;

    if (!validators.isValidId(id)) {
      return res.status(400).json({ error: 'Invalid instance ID' });
    }

    const result = await services.getDashboardFromSuperset(id, dashboardId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/superset-instances/:id/charts
 * Get charts from Superset instance
 */
exports.getCharts = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 0, pageSize = 20 } = req.query;

    if (!validators.isValidId(id)) {
      return res.status(400).json({ error: 'Invalid instance ID' });
    }

    const result = await services.getChartsFromSuperset(id, {
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching charts:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/superset-instances/:id/databases
 * Get databases from Superset instance
 */
exports.getDatabases = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validators.isValidId(id)) {
      return res.status(400).json({ error: 'Invalid instance ID' });
    }

    const result = await services.getDatabasesFromSuperset(id);
    res.json(result);
  } catch (error) {
    console.error('Error fetching databases:', error);
    res.status(500).json({ error: error.message });
  }
};
