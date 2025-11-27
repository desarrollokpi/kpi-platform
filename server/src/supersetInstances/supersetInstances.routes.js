/**
 * Superset Instances Routes
 * All routes require Root Admin access
 */

const express = require("express");
const router = express.Router();
const controller = require("./supersetInstances.controller");
const { hasToken } = require("../middleware/hasToken");
const { isRootAdmin } = require("../middleware/roleAuth");

// All routes require authentication and Root Admin role
router.use(hasToken);
router.use(isRootAdmin);

/**
 * @route   GET /api/superset-instances
 * @desc    Get all Superset instances
 * @access  Root Admin only
 */
router.get("/", controller.getAllSupersetInstances);

/**
 * @route   GET /api/superset-instances/active
 * @desc    Get all active Superset instances
 * @access  Root Admin only
 */
router.get("/active", controller.getActiveSupersetInstances);

/**
 * @route   GET /api/superset-instances/:id
 * @desc    Get Superset instance by ID
 * @access  Root Admin only
 */
router.get("/:id", controller.getSupersetInstanceById);

/**
 * @route   POST /api/superset-instances
 * @desc    Create a new Superset instance
 * @access  Root Admin only
 */
router.post("/", controller.createSupersetInstance);

/**
 * @route   PUT /api/superset-instances/:id
 * @desc    Update Superset instance
 * @access  Root Admin only
 */
router.put("/:id", controller.updateSupersetInstance);

/**
 * @route   DELETE /api/superset-instances/:id
 * @desc    Deactivate Superset instance
 * @access  Root Admin only
 */
router.delete("/:id", controller.deactivateSupersetInstance);

/**
 * @route   POST /api/superset-instances/:id/testConnection
 * @desc    Test connection to Superset instance
 * @access  Root Admin only
 */
router.post("/:id/testConnection", controller.testConnection);

/**
 * @route   POST /api/superset-instances/generateGuestToken
 * @desc    Generate guest token for embedded dashboard
 * @access  Authenticated users (not just Root Admin)
 */
router.post("/generateGuestToken", controller.generateGuestToken);

/**
 * @route   GET /api/superset-instances/:id/dashboards
 * @desc    Get dashboards from Superset instance
 * @access  Root Admin only
 */
router.get("/:id/dashboards", controller.getDashboards);

/**
 * @route   GET /api/superset-instances/:id/dashboards/:dashboardId
 * @desc    Get single dashboard from Superset instance
 * @access  Root Admin only
 */
router.get("/:id/dashboards/:dashboardId", controller.getDashboard);

/**
 * @route   GET /api/superset-instances/:id/charts
 * @desc    Get charts from Superset instance
 * @access  Root Admin only
 */
router.get("/:id/charts", controller.getCharts);

/**
 * @route   GET /api/superset-instances/:id/databases
 * @desc    Get databases from Superset instance
 * @access  Root Admin only
 */
router.get("/:id/databases", controller.getDatabases);

module.exports = router;
