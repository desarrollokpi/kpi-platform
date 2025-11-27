const express = require("express");
const router = express.Router();
const accountsController = require("./accounts.controller");
const { hasToken } = require("../middleware/hasToken");
const roleAuth = require("../middleware/roleAuth");
const { ROLE_NAMES } = require("../constants/roles");

router.get("/logoBySubdomain", accountsController.getLogoBySubdomain);

router.use(hasToken);

router.post("/", roleAuth([ROLE_NAMES.ROOT_ADMIN]), accountsController.createAccount);
router.get("/", roleAuth([ROLE_NAMES.ROOT_ADMIN]), accountsController.getAllAccounts);
router.get("/count", roleAuth([ROLE_NAMES.ROOT_ADMIN]), accountsController.getAccountCount);
router.get("/search", roleAuth([ROLE_NAMES.ROOT_ADMIN]), accountsController.searchAccounts);
router.put("/:id", roleAuth([ROLE_NAMES.ROOT_ADMIN]), accountsController.updateAccount);
router.delete("/:id", roleAuth([ROLE_NAMES.ROOT_ADMIN]), accountsController.deleteAccount);
router.post("/:id/activate", roleAuth([ROLE_NAMES.ROOT_ADMIN]), accountsController.activateAccount);
router.post("/:id/deactivate", roleAuth([ROLE_NAMES.ROOT_ADMIN]), accountsController.deactivateAccount);
router.post("/:id/contracts", roleAuth([ROLE_NAMES.ROOT_ADMIN]), accountsController.createContract);

router.get("/:id", roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), accountsController.getAccountById);
router.get("/:id/stats", roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), accountsController.getAccountStats);
router.get("/:id/instances", roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), accountsController.getAccountInstances);
router.get("/:id/workspaces", roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), accountsController.getAccountWorkspaces);
router.put("/:id/logo", roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), accountsController.updateLogo);
router.post("/:id/instances", roleAuth([ROLE_NAMES.ROOT_ADMIN]), accountsController.assignIntance);
router.delete("/:id/instances/:intanceId", roleAuth([ROLE_NAMES.ROOT_ADMIN]), accountsController.removeIntance);
router.get("/:id/contracts", roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]), accountsController.getContracts);

module.exports = router;
