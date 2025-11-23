const express = require('express')
const router = express.Router()
const invoicesController = require('./invoices.controller')

const hasToken = require('../middleware/hasToken')
const isAdmin = require('../middleware/isAdmin')

router.get(
  '/:contractId',
  [hasToken, isAdmin],
  invoicesController.readInvoicesByContract
)
router.get(
  '/details/:contractId',
  [hasToken, isAdmin],
  invoicesController.readInvoicesDetailByContract
)

module.exports = router
