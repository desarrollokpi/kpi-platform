/**
 * Access Control Controller
 * Handles HTTP requests for multi-tenant access control operations
 */

const services = require('./accessControl.services');
const validators = require('../../common/validators');

/**
 * ROOT ADMIN OPERATIONS
 */

/**
 * POST /api/access-control/accounts/:accountId/workspaces
 * Assign workspace to account
 */
exports.assignWorkspaceToAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { workspaceId } = req.body;

    if (!validators.isValidId(accountId)) {
      return res.status(400).json({ error: 'Invalid account ID' });
    }

    // Validate workspace assignment
    const validation = validators.validateWorkspaceAssignment({ workspaceId });
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const result = await services.assignWorkspaceToAccount(accountId, workspaceId);
    res.status(201).json({ message: 'Workspace assigned to account successfully', result });
  } catch (error) {
    console.error('Error assigning workspace to account:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/access-control/accounts/:accountId/reports
 * Assign specific report to account
 */
exports.assignReportToAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { reportId, active } = req.body;

    if (!validators.isValidId(accountId)) {
      return res.status(400).json({ error: 'Invalid account ID' });
    }

    // Validate report assignment
    const validation = validators.validateReportAssignment({ reportId, active });
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const result = await services.assignReportToAccount(accountId, reportId);
    res.status(201).json({ message: 'Report assigned to account successfully', result });
  } catch (error) {
    console.error('Error assigning report to account:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * DELETE /api/access-control/accounts/:accountId/reports/:reportId
 * Remove report from account
 */
exports.removeReportFromAccount = async (req, res) => {
  try {
    const { accountId, reportId } = req.params;

    if (!validators.isValidId(accountId)) {
      return res.status(400).json({ error: 'Invalid account ID' });
    }

    const result = await services.removeReportFromAccount(accountId, reportId);
    res.json({ message: 'Report removed from account successfully', result });
  } catch (error) {
    console.error('Error removing report from account:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/access-control/accounts/:accountId/available-reports
 * Get all reports available to an account
 */
exports.getAccountAvailableReports = async (req, res) => {
  try {
    const { accountId } = req.params;

    if (!validators.isValidId(accountId)) {
      return res.status(400).json({ error: 'Invalid account ID' });
    }

    const reports = await services.getAccountAvailableReports(accountId);
    res.json(reports);
  } catch (error) {
    console.error('Error fetching account available reports:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * TENANT ADMIN OPERATIONS
 */

/**
 * POST /api/access-control/users/:userId/reports
 * Assign report to user (Tenant Admin only)
 */
exports.assignReportToUser = async (req, res) => {
  try {
    const tenantAdminId = req.user.id;
    const { userId } = req.params;
    const { reportId, active } = req.body;

    if (!validators.isValidId(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Validate report assignment
    const validation = validators.validateReportAssignment({ reportId, active });
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const result = await services.assignReportToUser(tenantAdminId, userId, reportId);
    res.status(201).json({ message: 'Report assigned to user successfully', result });
  } catch (error) {
    console.error('Error assigning report to user:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * DELETE /api/access-control/users/:userId/reports/:reportId
 * Remove report from user
 */
exports.removeReportFromUser = async (req, res) => {
  try {
    const tenantAdminId = req.user.id;
    const { userId, reportId } = req.params;

    if (!validators.isValidId(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const result = await services.removeReportFromUser(tenantAdminId, userId, reportId);
    res.json({ message: 'Report removed from user successfully', result });
  } catch (error) {
    console.error('Error removing report from user:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * USER OPERATIONS
 */

/**
 * GET /api/access-control/my-reports
 * Get all reports accessible by current user
 */
exports.getMyAccessibleReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const reports = await services.getUserAccessibleReports(userId);
    res.json(reports);
  } catch (error) {
    console.error('Error fetching user accessible reports:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/access-control/reports/:reportId/access
 * Check if current user can access a specific report
 */
exports.checkReportAccess = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reportId } = req.params;

    const hasAccess = await services.userCanAccessReport(userId, reportId);
    res.json({ hasAccess });
  } catch (error) {
    console.error('Error checking report access:', error);
    res.status(500).json({ error: error.message });
  }
};
