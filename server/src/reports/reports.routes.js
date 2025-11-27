const express = require("express");
const router = express.Router();
const reportsController = require("./reports.controller");
const { hasToken } = require("../middleware/hasToken");
const roleAuth = require("../middleware/roleAuth");
const { ROLE_NAMES } = require("../constants/roles");

router.post("/", hasToken, roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), reportsController.createReport);
router.get("/", hasToken, roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), reportsController.getAllReports);
router.get("/:id", hasToken, roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), reportsController.getReportById);
router.put("/:id", hasToken, roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), reportsController.updateReport);
router.delete("/:id", hasToken, roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), reportsController.deleteReport);
router.post("/:id/activate", hasToken, roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), reportsController.activateReport);
router.get("/workspace/:workspaceId", hasToken, roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), reportsController.getReportsByWorkspace);

module.exports = router;
