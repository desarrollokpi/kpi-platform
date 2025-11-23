const jwt = require('jsonwebtoken')

async function isAdmin(req, res, next) {
  const token = req.cookies.t

  if (!token) {
    return res.status(401).json({
      message: 'No autorizado',
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.userId = decoded.id
    req.adminId = decoded.adminId
  } catch (error) {
    return res
      .status(401)
      .json({ message: 'No autorizado', error: error.stack })
  }

  next()
}

module.exports = isAdmin
