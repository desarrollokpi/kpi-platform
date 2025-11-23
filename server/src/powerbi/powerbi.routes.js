const express = require("express");
const router = express.Router();
const powerbiController = require("./powerbi.controller");

const hasToken = require("../middleware/hasToken");
const refreshSession = require("../middleware/refreshSession");

router.get("/token", [hasToken, refreshSession], powerbiController.getAccessToken);

router.get("/reportsInGroup", [hasToken, refreshSession], powerbiController.getReportsInGroup);

router.get("/workspaces", [hasToken, refreshSession], powerbiController.getDataSets);

router.get("/pagesInReport", [hasToken, refreshSession], powerbiController.getPagesInReport);

router.post("/reportData", [hasToken, refreshSession], powerbiController.getReportData);

module.exports = router;
