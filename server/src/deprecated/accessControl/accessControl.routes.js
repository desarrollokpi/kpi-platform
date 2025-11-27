/**
 * Access Control Routes
 * Multi-tenant access control for Root Admin, Tenant Admin, and Users
 */

const express = require("express");
const router = express.Router();
const controller = require("./accessControl.controller");
const { hasToken } = require("../middleware/hasToken");
const { isRootAdmin, isTenantAdmin, hasAnyRole } = require("../middleware/roleAuth");
const { ROLE_NAMES } = require("../db/schema/roles");

// All routes require authentication
router.use(hasToken);

/**
 * ROOT ADMIN ROUTES
 * Assign workspaces and reports to accounts
 */

/**
 * @route   POST /api/access-control/accounts/:accountId/workspaces
 * @desc    Assign workspace to account
 * @access  Root Admin only
 */
router.post("/accounts/:accountId/workspaces", isRootAdmin, controller.assignWorkspaceToAccount);

/**
 * @route   POST /api/access-control/accounts/:accountId/reports
 * @desc    Assign specific report to account
 * @access  Root Admin only
 */
router.post("/accounts/:accountId/reports", isRootAdmin, controller.assignReportToAccount);

/**
 * @route   DELETE /api/access-control/accounts/:accountId/reports/:reportId
 * @desc    Remove report from account
 * @access  Root Admin only
 */
router.delete("/accounts/:accountId/reports/:reportId", isRootAdmin, controller.removeReportFromAccount);

/**
 * @route   GET /api/access-control/accounts/:accountId/availableReports
 * @desc    Get all reports available to an account
 * @access  Root Admin or Tenant Admin (for their own account)
 */
router.get("/accounts/:accountId/availableReports", hasAnyRole(ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN), controller.getAccountAvailableReports);

/**
 * TENANT ADMIN ROUTES
 * Assign reports to users within their account
 */

/**
 * @route   POST /api/access-control/users/:userId/reports
 * @desc    Assign report to user (Tenant Admin can only assign to users in their account)
 * @access  Tenant Admin only
 */
router.post("/users/:userId/reports", isTenantAdmin, controller.assignReportToUser);

/**
 * @route   DELETE /api/access-control/users/:userId/reports/:reportId
 * @desc    Remove report from user
 * @access  Tenant Admin only
 */
router.delete("/users/:userId/reports/:reportId", isTenantAdmin, controller.removeReportFromUser);

/**
 * USER ROUTES
 * View accessible reports
 */

/**
 * @route   GET /api/access-control/myReports
 * @desc    Get all reports accessible by current user
 * @access  Any authenticated user
 */
router.get("/myReports", controller.getMyAccessibleReports);

/**
 * @route   GET /api/access-control/reports/:reportId/access
 * @desc    Check if current user can access a specific report
 * @access  Any authenticated user
 */
router.get("/reports/:reportId/access", controller.checkReportAccess);

module.exports = router;
