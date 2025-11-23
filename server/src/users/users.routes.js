const express = require('express')
const router = express.Router()
const usersController = require('./users.controller')
const usersAuthController = require('./users.auth.controller')

const hasToken = require('../middleware/hasToken')
const isAdmin = require('../middleware/isAdmin')
const isUser = require('../middleware/isUser')

// User
router.get('/profile', [hasToken, isUser], usersController.readProfile)

router.put(
  '/changePassword',
  [hasToken, isUser],
  usersController.updateUserPasswordByUser
)

// Admin
router.get('/', [hasToken, isAdmin], usersController.readUsersByAdminId)
router.get('/', [hasToken, isAdmin], usersController.readUsersByAdminId)
router.post('/', [hasToken, isAdmin], usersController.createUserByAdmin)
router.put('/:userId', [hasToken, isAdmin], usersController.updateUserByAdmin)

// Auth
router.post('/signIn', usersAuthController.signIn)
router.post('/signOut', [hasToken, isUser], usersAuthController.signOut)

module.exports = router
