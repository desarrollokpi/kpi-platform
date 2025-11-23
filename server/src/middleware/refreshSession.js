const jwt = require('jsonwebtoken')
const roles = require('../constants/roles')
const adminsAuthServices = require('../admins/admins.auth.services')
const usersAuthServices = require('../users/users.auth.services')

const refreshSession = async (req, res, next) => {
  const token = req.cookies.t

  if (!token) {
    return res.status(401).json({
      message: 'No autorizado',
    })
  }
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET)

  const userRole = decoded.role

  if (userRole === roles.ADMIN) {
    adminsAuthServices.refreshSession(decoded.id)
  } else if (userRole === roles.USER) {
    usersAuthServices.refreshSession(decoded.id)
  }

  next()
}

module.exports = refreshSession