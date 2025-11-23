const express = require('express')
const router = express.Router()
const reportsController = require('./reports.controller')

const hasToken = require('../middleware/hasToken')
const isAdmin = require('../middleware/isAdmin')
const isUser = require('../middleware/isUser')

router.post(
  '/groups',
  [hasToken, isAdmin],
  reportsController.createReportGroupByAdmin
)

router.get(
  '/groups',
  [hasToken, isAdmin],
  reportsController.readReportGroupsByAdmin
)

router.get('/', [hasToken, isAdmin], reportsController.readReportsByAdmin)

router.get(
  '/byWorkspace',
  [hasToken, isAdmin],
  reportsController.readReportsByWorkspace
)

router.get('/users', [hasToken, isUser], reportsController.readReportsByUser)

router.put(
  '/groups/:reportGroupId',
  [hasToken, isAdmin],
  reportsController.updateReportGroupByAdmin
)

router.put(
  '/toggleActive/:reportId',
  [hasToken, isAdmin],
  reportsController.updateReportActiveStateByAdmin
)

module.exports = router
