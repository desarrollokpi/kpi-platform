const express = require('express')
const router = express.Router()
const termsAndConditionsController = require('./termsAndConditions.controller')

router.get('/', termsAndConditionsController.readTermsAndConditions)

module.exports = router
