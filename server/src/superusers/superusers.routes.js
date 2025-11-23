const express = require('express')
const router = express.Router()
const superusersController = require('./superusers.controller')
const superusersAuthController = require('./superusers.auth.controller')

const handleImageUpload = require('../middleware/handleImageUpload')
const hasToken = require('../middleware/hasToken')
const isSuperuser = require('../middleware/isSuperuser')

router.get(
  '/profile',
  [hasToken, isSuperuser],
  superusersController.readProfile
)

router.get('/logo', [hasToken, isSuperuser], superusersController.readLogo)

router.post(
  '/termsAndConditions',
  [hasToken, isSuperuser],
  superusersController.acceptTermsAndConditions
)

router.put(
  '/logo',
  [hasToken, isSuperuser, handleImageUpload],
  superusersController.updateLogo
)

router.put(
  '/changePassword',
  [hasToken, isSuperuser],
  superusersController.changePassword
)

router.put(
  '/changeUserPassword',
  [hasToken, isSuperuser],
  superusersController.changeUserPassword
)

router.get('/logoBySubdomain', superusersController.readLogoBySubdomain)

// Auth
router.post('/signIn', superusersAuthController.signIn)
router.post(
  '/signOut',
  [hasToken, isSuperuser],
  superusersAuthController.signOut
)

router.get('/secret', [hasToken, isSuperuser], (req, res) =>
  res.send(`SUCCESS: superuser private route (id: ${req.userId})`)
)

module.exports = router
