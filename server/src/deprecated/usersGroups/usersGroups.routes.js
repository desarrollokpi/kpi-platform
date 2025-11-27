const express = require('express')
const router = express.Router()
const usersGroupsController = require('./usersGroups.controller')

const { hasToken } = require("../middleware/hasToken");
const isAdmin = require('../middleware/isAdmin')

router.get('/', [hasToken, isAdmin], usersGroupsController.readUsersGroups)
router.get(
  '/independentSections',
  [hasToken, isAdmin],
  usersGroupsController.readIndependentSectionsIds
)
router.post('/', [hasToken, isAdmin], usersGroupsController.createUsersGroup)
router.put(
  '/:usersGroupId',
  [hasToken, isAdmin],
  usersGroupsController.updateUsersGroup
)

module.exports = router
