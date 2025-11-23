const superusersAuthServices = require('./superusers.auth.services')
const superusersServices = require('./superusers.services')
const signToken = require('./../common/signToken')
const roles = require('./../constants/roles')

exports.signIn = async (req, res) => {
  const { name, password } = req.body

  try {
    const superuserId = await superusersAuthServices.signIn(name, password)
    const superuser = await superusersServices.readProfile(superuserId)

    const token = signToken({ id: superuserId, role: roles.SUPERUSER })

    res.cookie('t', token)
    res.cookie('r', roles.SUPERUSER)

    res.send(superuser)
  } catch (error) {
    return res.status(400).send(error)
  }
}

exports.signOut = async (req, res) => {
  res.clearCookie('t')
  res.send({ message: 'Sesión finalizada de forma exitosa' })
}
