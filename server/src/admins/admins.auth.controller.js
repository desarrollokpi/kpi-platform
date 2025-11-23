const adminsAuthServices = require('./admins.auth.services')
const adminsServices = require('./admins.services')
const signToken = require('./../common/signToken')
const roles = require('./../constants/roles')

exports.signIn = async (req, res) => {
  const { name, password, subdomain } = req.body

  try {
    const adminId = await adminsAuthServices.signIn(name, password, subdomain)
    const admin = await adminsServices.readProfile(adminId)

    const token = signToken({ id: adminId, role: roles.ADMIN })

    res.cookie('t', token)
    res.cookie('r', roles.ADMIN)

    res.send(admin)
  } catch (error) {
    return res.status(400).send(error)
  }
}

exports.signOut = async (req, res) => {
  await adminsAuthServices.signOut(req.userId)

  res.clearCookie('t')
  res.send({ message: 'Sesión finalizada de forma exitosa' })
}

exports.timeAvailableInSession = async (req, res) => {
  const time = await adminsAuthServices.timeAvailableInSession(req.userId)

  try {
    res.send({ time })
  } catch (error) {
    return res.status(400).send(error)
  }
}