const express = require('express')
const router = express.Router()
const locationsController = require('./locations.controller')

const hasToken = require('../middleware/hasToken')
const isAdmin = require('../middleware/isAdmin')

module.exports = router
