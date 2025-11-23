const superuserservices = require('./superusers.services')

exports.readProfile = async (req, res) => {
  try {
    const profile = await superuserservices.readProfile(req.userId)

    res.send(profile)
  } catch (error) {
    return res.status(400).send(error)
  }
}

exports.readLogo = async (req, res) => {
  try {
    const logo = await superuserservices.readLogo(req.userId)

    res.send(logo)
  } catch (error) {
    return res.status(400).send(error)
  }
}

exports.acceptTermsAndConditions = async (req, res) => {
  try {
    await superuserservices.acceptTermsAndConditions(
      req.userId,
      req.body.termsAndConditionsId
    )

    const profile = await superuserservices.readProfile(req.userId)

    res.send(profile)
  } catch (error) {
    return res.status(400).send(error)
  }
}

exports.updateLogo = async (req, res) => {
  try {
    const file = req.files[0]

    await superuserservices.updateLogo(file.filename, req.userId)

    const logo = await superuserservices.readLogo(req.userId)

    res.send({ message: 'Logo actualizado con éxito', logo })
  } catch (error) {
    return res.status(400).send(error)
  }
}

exports.changePassword = async (req, res) => {
  try {
    await superuserservices.changePassword(req.userId, req.body.password)

    res.send({ message: 'Password actualizado con éxito' })
  } catch (error) {
    return res.status(400).send(error)
  }
}

exports.changeUserPassword = async (req, res) => {
  const { password, userId } = req.body

  try {
    await superuserservices.changeUserPassword(userId, password)

    res.send({ message: 'Password actualizado con éxito' })
  } catch (error) {
    return res.status(400).send(error.stack)
  }
}

exports.readLogoBySubdomain = async (req, res) => {
  try {
    const logo = await superuserservices.readLogoBySubdomain(
      req.query.subdomain
    )

    res.send(logo)
  } catch (error) {
    return res.status(400).send(error)
  }
}
