const jwt = require('jsonwebtoken')
const usersAuthServices = require('../users/users.auth.services')
const roles = require('./../constants/roles')

async function isUser(req, res, next) {
  const token = req.cookies.t

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const isUser = decoded.role === roles.USER

    const isUserIsLoggedIn = await usersAuthServices.compareUsersIds(decoded.id)

    if (!isUser) {
      return res.status(401).json({ message: 'No autorizado' })
    }

    if (!isUserIsLoggedIn) {
      return res.status(401).json({
        message: 'Su sesión ha caducado, por favor ingrese nuevamente',
      })
    }

    usersAuthServices.refreshSession(decoded.id)
  } catch (error) {
    return res
      .status(401)
      .json({ message: 'No autorizado', error: error.message })
  }

  next()
}

module.exports = isUser
