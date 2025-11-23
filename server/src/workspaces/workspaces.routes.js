const express = require('express')
const router = express.Router()
const workspacesController = require('./workspaces.controller')

const hasToken = require('../middleware/hasToken')
const isAdmin = require('../middleware/isAdmin')
const isUser = require('../middleware/isUser')

router.get('/', [hasToken, isAdmin], workspacesController.readWorkspacesByAdmin)

router.get(
  '/users',
  [hasToken, isUser],
  workspacesController.readWorkspacesByUser
)

module.exports = router
