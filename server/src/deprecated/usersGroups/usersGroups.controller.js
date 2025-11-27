const usersGroupsServices = require('./usersGroups.services')

async function createUsersGroup(req, res) {
  try {
    const { code, name, active, users, reportsGroups, sections } = req.body

    await usersGroupsServices.createUsersGroup(
      code,
      name,
      active,
      users,
      reportsGroups,
      sections
    )

    res.send({ message: 'Grupo de usuarios creado exitosamente' })
  } catch (error) {
    return res.status(400).send(error.stack)
  }
}

async function updateUsersGroup(req, res) {
  try {
    const { code, name, active, users, reportsGroups, sections } = req.body

    await usersGroupsServices.updateUsersGroup(
      req.params.usersGroupId,
      code,
      name,
      active,
      users,
      reportsGroups,
      sections
    )

    const usersGroups = await usersGroupsServices.readUsersGroups(req.userId)

    res.send(usersGroups)
  } catch (error) {
    return res.status(400).send(error.stack)
  }
}

async function readUsersGroups(req, res) {
  try {
    const usersGroups = await usersGroupsServices.readUsersGroups(req.userId)

    res.send(usersGroups)
  } catch (error) {
    return res.status(400).send(error.message)
  }
}

async function readIndependentSectionsIds(req, res) {
  try {
    const { usersIds, reportsGroupsIds } = req.body

    const usersGroups = await usersGroupsServices.readIndependentSectionsIds(
      req.userId,
      usersIds,
      reportsGroupsIds
    )

    res.send(usersGroups)
  } catch (error) {
    return res.status(400).send(error.message)
  }
}

module.exports = {
  createUsersGroup,
  readUsersGroups,
  readIndependentSectionsIds,
  updateUsersGroup,
}
