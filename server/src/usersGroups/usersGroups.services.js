const usersGroupsRepository = require('./usersGroups.repository')

async function createUsersGroup(
  code,
  name,
  active,
  users,
  reportsGroups,
  sections
) {
  const usersGroupId = await usersGroupsRepository.createUsersGroup(
    code,
    name,
    active
  )

  await usersGroupsRepository.addUsersToUsersGroup(usersGroupId, users)

  await usersGroupsRepository.addReportsGroupsToUsersGroup(
    usersGroupId,
    reportsGroups
  )

  if (sections.length > 0)
    await usersGroupsRepository.addSectionsToUsersGroup(usersGroupId, sections)
}

async function readUsersGroups(adminId) {
  const usersGroups = await usersGroupsRepository.readUsersGroups(adminId)

  const usersGroupsWithUsers = await Promise.all(
    usersGroups.map(async usersGroup => ({
      ...usersGroup,
      usersIds: await usersGroupsRepository.readUsersGroupsUsers(
        adminId,
        usersGroup.id
      ),
    }))
  )

  const usersGroupsWithReportsGroups = await Promise.all(
    usersGroupsWithUsers.map(async usersGroup => ({
      ...usersGroup,
      reportsGroupsIds:
        await usersGroupsRepository.readUsersGroupsReportsGroups(
          adminId,
          usersGroup.id
        ),
    }))
  )

  const usersGroupsWithSections = usersGroupsWithReportsGroups.map(
    async usersGroup => ({
      ...usersGroup,
      sectionsIds: await usersGroupsRepository.readUsersGroupsSections(
        adminId,
        usersGroup.id
      ),
    })
  )

  return Promise.all(usersGroupsWithSections)
}

async function readIndependentSectionsIds(adminId, usersIds, reportsGroupsIds) {
  return await usersGroupsRepository.readIndependentSectionsIds(
    adminId,
    usersIds,
    reportsGroupsIds
  )
}

async function updateUsersGroup(
  usersGroupId,
  code,
  name,
  active,
  users,
  reportsGroups,
  sections
) {
  await usersGroupsRepository.updateUsersGroup(code, name, active, usersGroupId)

  await usersGroupsRepository.deleteUsersFromUsersGroup(usersGroupId)
  await usersGroupsRepository.addUsersToUsersGroup(usersGroupId, users)

  await usersGroupsRepository.deleteReportsGroupsFromUsersGroup(usersGroupId)
  await usersGroupsRepository.addReportsGroupsToUsersGroup(
    usersGroupId,
    reportsGroups
  )

  if (sections.length > 0) {
    await usersGroupsRepository.deleteSectionsFromUsersGroup(usersGroupId)
    await usersGroupsRepository.addSectionsToUsersGroup(usersGroupId, sections)
  }
}

module.exports = {
  createUsersGroup,
  readUsersGroups,
  readIndependentSectionsIds,
  updateUsersGroup,
}
