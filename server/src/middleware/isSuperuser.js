const jwt = require('jsonwebtoken')
const superusersAuthServices = require('../superusers/superusers.auth.services')
const roles = require('../constants/roles')

async function isSuperuser(req, res, next) {
  const token = req.cookies.t

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const isSuperuser = decoded.role === roles.SUPERUSER

    if (!isSuperuser) {
      return res.status(401).json({ message: 'No autorizado' })
    }
  } catch (error) {
    return res
      .status(401)
      .json({ message: 'No autorizado', error: error.message })
  }

  next()
}

module.exports = isSuperuser
