const express = require('express')
const router = express.Router()
const identificationDocumentsController = require('./identificationDocuments.controller')

const { hasToken } = require("../middleware/hasToken");
const isAdmin = require('../middleware/isAdmin')

router.get(
  '/',
  [hasToken, isAdmin],
  identificationDocumentsController.readIdentificationDocuments
)

module.exports = router
