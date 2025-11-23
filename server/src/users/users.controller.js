const usersServices = require('./users.services')

exports.createUserByAdmin = async (req, res) => {
  try {
    const user = req.body

    const { reportGroups } = req.body

    await usersServices.createUserByAdmin(user, reportGroups, req.userId)

    res.send({ message: 'Usuario creado exitosamente' })
  } catch (error) {
    return res.status(400).send(error.message)
  }
}

exports.readProfile = async (req, res) => {
  try {
    const user = await usersServices.readProfile(req.userId)

    user.adminId = undefined

    res.send(user)
  } catch (error) {
    return res.status(400).send(error)
  }
}

exports.readSubdomain = async (req, res) => {
  // res.header("Access-Control-Allow-Headers", ["Content-Type","X-Requested-With","X-HTTP-Method-Override","Accept"]);
  //   res.header("Access-Control-Allow-Credentials", true);
  //   res.header("Access-Control-Allow-Methods", "GET,POST");
  //   res.header("Cache-Control", "no-store,no-cache,must-revalidate");
  //   res.header("Vary", "Origin");
  try {
    const users = await usersServices.readSubdomain(req.params.subdomain)

    res.send(users)
  } catch (error) {
    return res.status(400).send(error)
  }
}

exports.readUsersByAdminId = async (req, res) => {
  try {
    const users = await usersServices.readUsersByAdminId(req.userId)

    res.send(users)
  } catch (error) {
    return res.status(400).send(error.stack)
  }
}

exports.updateUserPasswordByUser = async (req, res) => {
  try {
    await usersServices.updateUserPasswordByUser(req.userId, req.body.password)

    res.send({ message: 'Password actualizado con éxito' })
  } catch (error) {
    return res.status(400).send(error.stack)
  }
}

exports.updateUserByAdmin = async (req, res) => {
  try {
    const { username, name, mail, active, reportGroups } = req.body

    await usersServices.updateUserByAdmin(
      req.userId,
      req.params.userId,
      username,
      name,
      mail,
      active,
      reportGroups
    )

    const user = await usersServices.readOneUserByAdmin(
      parseInt(req.params.userId),
      req.userId
    )

    res.send(user)
  } catch (error) {
    return res.status(400).send(error.stack)
  }
}
