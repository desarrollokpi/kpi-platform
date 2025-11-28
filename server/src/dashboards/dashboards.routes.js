const express = require("express");
const router = express.Router();
const dashboardsController = require("./dashboards.controller");
const { hasToken } = require("../middleware/hasToken");
const roleAuth = require("../middleware/roleAuth");
const { ROLE_NAMES } = require("../constants/roles");

router.use(hasToken);

router.get("/", dashboardsController.getAllDashboards);
router.get("/instancesForSelect", dashboardsController.getDashboardsInstancesForSelect);

router.post("/", roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), dashboardsController.createDashboard);

router.get("/user/:userId", dashboardsController.getUserDashboards);

router.get("/:id", dashboardsController.getDashboardById);

router.put("/:id", roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), dashboardsController.updateDashboard);

router.delete("/:id", roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), dashboardsController.deleteDashboard);

router.get("/:id/embedInfo", dashboardsController.getDashboardEmbedInfo);

router.get("/:id/users", roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), dashboardsController.getDashboardUsers);

router.post("/:id/assignUser", roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), dashboardsController.assignDashboardToUser);

router.delete("/:id/removeUser/:userId", roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), dashboardsController.removeDashboardFromUser);

router.get("/:id/exportCsv", dashboardsController.exportDashboardToCsv);

router.post("/:id/sendEmail", dashboardsController.sendDashboardEmail);

router.get("/:id/embeddedConfig", dashboardsController.getDashboardEmbeddedConfig);

module.exports = router;
