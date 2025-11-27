/**
 * Superset Instances Repository
 * Data access layer for Superset instances
 */

const { poolConnection } = require('../../database');
const queries = require('./supersetInstances.queries');

/**
 * Get all Superset instances
 * @returns {Promise<Array>}
 */
exports.findAll = async () => {
  const [rows] = await poolConnection.query(queries.GET_ALL_SUPERSET_INSTANCES);
  return rows;
};

/**
 * Get all active Superset instances
 * @returns {Promise<Array>}
 */
exports.findAllActive = async () => {
  const [rows] = await poolConnection.query(queries.GET_ACTIVE_SUPERSET_INSTANCES);
  return rows;
};

/**
 * Get Superset instance by ID
 * @param {number} id - Instance ID
 * @returns {Promise<Object|null>}
 */
exports.findById = async (id) => {
  const [rows] = await poolConnection.query(queries.GET_SUPERSET_INSTANCE_BY_ID, [id]);
  return rows[0] || null;
};

/**
 * Check if instance has associated workspaces
 * @param {number} id - Instance ID
 * @returns {Promise<boolean>}
 */
exports.hasAssociatedWorkspaces = async (id) => {
  const [rows] = await poolConnection.query(queries.CHECK_INSTANCE_HAS_WORKSPACES, [id]);
  return rows[0].count > 0;
};

/**
 * Create new Superset instance
 * @param {Object} data - Instance data
 * @param {string} data.name - Instance name
 * @param {string} data.baseUrl - Superset base URL
 * @param {number} data.active - Active status
 * @returns {Promise<number>} - Inserted ID
 */
exports.create = async (data) => {
  const [result] = await poolConnection.query(
    queries.CREATE_SUPERSET_INSTANCE,
    [data.name, data.baseUrl, data.active]
  );
  return result.insertId;
};

/**
 * Update Superset instance
 * @param {number} id - Instance ID
 * @param {Object} data - Update data
 * @returns {Promise<void>}
 */
exports.update = async (id, data) => {
  await poolConnection.query(
    queries.UPDATE_SUPERSET_INSTANCE,
    [data.name, data.baseUrl, data.active, id]
  );
};

/**
 * Soft delete (deactivate) Superset instance
 * @param {number} id - Instance ID
 * @returns {Promise<void>}
 */
exports.softDelete = async (id) => {
  await poolConnection.query(queries.DEACTIVATE_SUPERSET_INSTANCE, [id]);
};

/**
 * Get user with account information
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>}
 */
exports.findUserWithAccount = async (userId) => {
  const [rows] = await poolConnection.query(queries.GET_USER_WITH_ACCOUNT, [userId]);
  return rows[0] || null;
};

/**
 * Check if user has access to report
 * @param {number} userId - User ID
 * @param {string} reportId - Report ID
 * @returns {Promise<boolean>}
 */
exports.checkUserReportAccess = async (userId, reportId) => {
  const [rows] = await poolConnection.query(queries.CHECK_USER_REPORT_ACCESS, [userId, reportId]);
  return rows[0].hasAccess > 0;
};

/**
 * Get report by ID
 * @param {string} reportId - Report ID
 * @returns {Promise<Object|null>}
 */
exports.findReportById = async (reportId) => {
  const [rows] = await poolConnection.query(queries.GET_REPORT_BY_ID, [reportId]);
  return rows[0] || null;
};

/**
 * Get workspace for report
 * @param {string} reportId - Report ID
 * @returns {Promise<Object|null>}
 */
exports.findWorkspaceForReport = async (reportId) => {
  const [rows] = await poolConnection.query(queries.GET_WORKSPACE_FOR_REPORT, [reportId]);
  return rows[0] || null;
};
