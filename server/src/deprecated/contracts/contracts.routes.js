const express = require('express')
const router = express.Router()
const contractsController = require('./contracts.controller')

const { hasToken } = require("../middleware/hasToken");
const isAdmin = require('../middleware/isAdmin')

router.get('/', [hasToken, isAdmin], contractsController.readContractByAdmin)
router.get(
  '/details/:contractId',
  [hasToken, isAdmin],
  contractsController.readContractDetailsByAdmin
)
router.post('/', [hasToken, isAdmin], contractsController.createContractByAdmin)
router.put(
  '/:contractId',
  [hasToken, isAdmin],
  contractsController.updateContractByAdmin
)

// Detalles
router.put(
  '/details/:contractDetailId',
  [hasToken, isAdmin],
  contractsController.updateContractDetailByAdmin
)

module.exports = router
