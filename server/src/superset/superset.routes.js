const express = require("express");
const router = express.Router();
const controller = require("./superset.controller");

// Legacy endpoint - requires authentication
router.post("/generateEmbedded", controller.generateEmbedded);

// Simple endpoint for testing - no authentication
// WARNING: For development/testing only!
router.post("/generateEmbeddedSimple", controller.generateEmbeddedSimple);

module.exports = router;
