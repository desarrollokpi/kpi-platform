const express = require('express')
const router = express.Router()
const currenciesController = require('./currencies.controller')

const hasToken = require('../middleware/hasToken')
const isAdmin = require('../middleware/isAdmin')

router.get('/', [hasToken, isAdmin], currenciesController.readCurrencies)

module.exports = router
