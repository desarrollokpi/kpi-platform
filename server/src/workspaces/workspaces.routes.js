const express = require("express");
const router = express.Router();
const workspacesController = require("./workspaces.controller");
const { hasToken } = require("../middleware/hasToken");
const roleAuth = require("../middleware/roleAuth");
const { ROLE_NAMES } = require("../constants/roles");

router.post("/", hasToken, roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), workspacesController.createWorkspace);

router.get("/", hasToken, roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), workspacesController.getAllWorkspaces);

router.get("/:id", hasToken, roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), workspacesController.getWorkspaceById);

router.put("/:id", hasToken, roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), workspacesController.updateWorkspace);

router.delete("/:id", hasToken, roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), workspacesController.deleteWorkspace);

router.post("/:id/activate", hasToken, roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), workspacesController.activateWorkspace);
router.post("/:id/deactivate", hasToken, roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), workspacesController.deactivateWorkspace);

router.get("/account/:accountId", hasToken, roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), workspacesController.getWorkspacesByAccount);

router.get("/user/:userId", hasToken, roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN, ROLE_NAMES.USER]), workspacesController.getWorkspacesByUser);

router.post(
  "/account-instance/:accountInstanceId/assign",
  hasToken,
  roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]),
  workspacesController.assignWorkspaceToAccountInstance
);

router.delete(
  "/account-instance/:accountInstanceId/workspace/:workspaceId",
  hasToken,
  roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]),
  workspacesController.removeWorkspaceFromAccountInstance
);

router.post("/user/:userId/assign", hasToken, roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), workspacesController.assignWorkspaceToUser);

router.delete(
  "/user/:userId/workspace/:workspaceId",
  hasToken,
  roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]),
  workspacesController.removeWorkspaceFromUser
);

module.exports = router;
