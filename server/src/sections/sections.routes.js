const express = require('express')
const router = express.Router()
const sectionsController = require('./sections.controller')

const hasToken = require('../middleware/hasToken')
const isAdmin = require('../middleware/isAdmin')
const isUser = require('../middleware/isUser')

router.get('/', [hasToken, isAdmin], sectionsController.readSectionsByAdmin)

router.get('/users', [hasToken, isUser], sectionsController.readSectionsByUser)

router.get(
  '/byReport',
  [hasToken, isAdmin],
  sectionsController.readSectionsByReport
)

module.exports = router
