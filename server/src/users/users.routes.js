const express = require("express");
const router = express.Router();
const usersController = require("./users.controller");
const { hasToken } = require("../middleware/hasToken");
const roleAuth = require("../middleware/roleAuth");
const { ROLE_NAMES } = require("../constants/roles");

router.use(hasToken);

router.get("/profile", usersController.getProfile);
router.put("/profile/password", usersController.changeOwnPassword);
router.get("/", roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), usersController.getAllUsers);
router.post("/", roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), usersController.createUser);
router.get("/account/:accountId", roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), usersController.getUsersByAccount);
router.get("/:id", roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), usersController.getUserById);
router.put("/:id", roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), usersController.updateUser);
router.put("/:id/password", roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), usersController.changePassword);
router.post("/:id/assignDashboards", roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), usersController.assignDashboardsToUser);
router.post("/:id/activate", roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), usersController.activateUser);
router.post("/:id/deactivate", roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), usersController.deactivateUser);
router.delete("/:id", roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), usersController.deleteUser);
router.post("/:id/roles", roleAuth([ROLE_NAMES.ROOT_ADMIN]), usersController.assignRole);
router.delete("/:id/roles/:roleName", roleAuth([ROLE_NAMES.ROOT_ADMIN]), usersController.removeRole);

module.exports = router;
