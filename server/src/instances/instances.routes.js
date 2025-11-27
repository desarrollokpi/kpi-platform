const express = require("express");
const router = express.Router();
const instancesController = require("./instances.controller");
const { hasToken } = require("../middleware/hasToken");
const roleAuth = require("../middleware/roleAuth");
const { ROLE_NAMES } = require("../constants/roles");

router.post(
  "/",
  hasToken,
  roleAuth([ROLE_NAMES.ROOT_ADMIN]),
  instancesController.createIntance
);

router.get(
  "/",
  hasToken,
  roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]),
  instancesController.getAllInstances
);

router.get(
  "/:id",
  hasToken,
  roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]),
  instancesController.getIntanceById
);

router.put(
  "/:id",
  hasToken,
  roleAuth([ROLE_NAMES.ROOT_ADMIN]),
  instancesController.updateIntance
);

router.delete(
  "/:id",
  hasToken,
  roleAuth([ROLE_NAMES.ROOT_ADMIN]),
  instancesController.deleteIntance
);

router.post(
  "/:id/activate",
  hasToken,
  roleAuth([ROLE_NAMES.ROOT_ADMIN]),
  instancesController.activateIntance
);

router.get(
  "/account/:accountId",
  hasToken,
  roleAuth([ROLE_NAMES.ROOT_ADMIN, ROLE_NAMES.TENANT_ADMIN]),
  instancesController.getInstancesByAccount
);

router.get(
  "/:id/accounts",
  hasToken,
  roleAuth([ROLE_NAMES.ROOT_ADMIN]),
  instancesController.getAccountsByIntance
);

module.exports = router;
