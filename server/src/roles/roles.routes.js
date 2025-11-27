const express = require("express");
const router = express.Router();
const rolesController = require("./roles.controller");
const { hasToken } = require("../middleware/hasToken");
const roleAuth = require("../middleware/roleAuth");
const { ROLE_NAMES } = require("../constants/roles");

router.use(hasToken);
router.use(roleAuth([ROLE_NAMES.ROOT_ADMIN]));

router.get("/select", rolesController.getRolesForSelect);
router.get("/root-admins/users", rolesController.getRootAdmins);
router.get("/tenant-admins/users", rolesController.getTenantAdmins);
router.get("/user/:userId", rolesController.getUserRoles);
router.get("/user/:userId/has/:roleName", rolesController.checkUserHasRole);
router.get("/:name/users", rolesController.getUsersByRole);
router.get("/:name", rolesController.getRoleByName);
router.get("/", rolesController.getAllRoles);

module.exports = router;
