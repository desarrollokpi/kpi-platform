const express = require("express");
const router = express.Router();
const controller = require("./superset.controller");

router.post("/generate-embedded", controller.generateEmbedded);

module.exports = router;
