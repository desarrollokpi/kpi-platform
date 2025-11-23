const express = require('express')
const router = express.Router()
const locationsController = require('./locations.controller')

const hasToken = require('../middleware/hasToken')
const isAdmin = require('../middleware/isAdmin')

router.get('/countries', [hasToken, isAdmin], locationsController.readCountries)
router.get('/regions', [hasToken, isAdmin], locationsController.readRegions)
router.get('/zones', [hasToken, isAdmin], locationsController.readZones)

module.exports = router
