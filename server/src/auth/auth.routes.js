const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const { hasToken } = require("../middleware/hasToken");

router.post("/signIn", authController.signIn);
router.post("/signOut", hasToken, authController.signOut);
router.get("/me", hasToken, authController.getCurrentUser);
router.post("/refresh", hasToken, authController.refreshSession);
router.get("/status", hasToken, authController.checkStatus);

module.exports = router;
