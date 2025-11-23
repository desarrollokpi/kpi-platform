const connection = require('../../database')
const usersGroupsQueries = require('./usersGroups.queries')

async function createUsersGroup(code, name, active) {
  return new Promise(resolve => {
    connection.query(
      usersGroupsQueries.CREATE_USERS_GROUP,
      Array.from(arguments),
      (error, result) => {
        if (error) throw error

        return resolve(result.insertId)
      }
    )
  })
}

async function addUsersToUsersGroup(usersGroupId, users) {
  const usersGroupUsers = users.map(userId => [usersGroupId, userId])

  connection.query(
    usersGroupsQueries.ADD_USERS_TO_USERS_GROUP,
    [usersGroupUsers],
    (error, result) => {
      if (error) throw error
    }
  )
}

async function addReportsGroupsToUsersGroup(usersGroupId, reportsGroups) {
  const usersGroupReportsGroups = reportsGroups.map(reportsGroupId => [
    usersGroupId,
    reportsGroupId,
  ])

  connection.query(
    usersGroupsQueries.ADD_REPORTS_GROUPS_TO_USERS_GROUP,
    [usersGroupReportsGroups],
    (error, result) => {
      if (error) throw error
    }
  )
}

async function addSectionsToUsersGroup(usersGroupId, sections) {
  const usersGroupSections = sections.map(sectionId => [
    usersGroupId,
    sectionId,
  ])

  connection.query(
    usersGroupsQueries.ADD_SECTIONS_TO_USERS_GROUP,
    [usersGroupSections],
    (error, result) => {
      if (error) throw error
    }
  )
}

async function readUsersGroups(adminId) {
  return new Promise(resolve => {
    connection.query(
      usersGroupsQueries.READ_USERS_GROUPS,
      [adminId],
      (error, result) => {
        if (error) throw error

        return resolve(result)
      }
    )
  })
}

async function readUsersGroupsUsers(adminId, usersGroupId) {
  return new Promise(resolve => {
    connection.query(
      { sql: usersGroupsQueries.READ_USERS_GROUPS_USERS, rowsAsArray: true },
      [adminId, usersGroupId],
      (error, result) => {
        if (error) throw error

        return resolve(result.flat())
      }
    )
  })
}

async function readUsersGroupsReportsGroups(adminId, usersGroupId) {
  return new Promise(resolve => {
    connection.query(
      {
        sql: usersGroupsQueries.READ_USERS_GROUPS_REPORTS_GROUPS,
        rowsAsArray: true,
      },
      [adminId, usersGroupId],
      (error, result) => {
        if (error) throw error

        return resolve(result.flat())
      }
    )
  })
}

async function readUsersGroupsSections(adminId, usersGroupId) {
  return new Promise(resolve => {
    connection.query(
      {
        sql: usersGroupsQueries.READ_USERS_GROUPS_SECTIONS,
        rowsAsArray: true,
      },
      [adminId, usersGroupId],
      (error, result) => {
        if (error) throw error

        return resolve(result.flat())
      }
    )
  })
}

async function readIndependentSectionsIds(adminId, usersIds, reportsGroupsIds) {
  return new Promise(resolve => {
    connection.query(
      {
        sql: usersGroupsQueries.READ_INDEPENDENT_SECTIONS_IDS,
        rowsAsArray: true,
      },
      [adminId, [usersIds], [reportsGroupsIds]],
      (error, result) => {
        if (error) throw error

        return resolve(result.flat())
      }
    )
  })
}

async function updateUsersGroup(code, name, active, usersGroupId) {
  connection.query(
    usersGroupsQueries.UPDATE_USERS_GROUP,
    Array.from(arguments),
    (error, result) => {
      if (error) throw error
    }
  )
}

async function deleteUsersFromUsersGroup(usersGroupId) {
  connection.query(
    usersGroupsQueries.DELETE_USERS_FROM_USERS_GROUP,
    [usersGroupId],
    (error, result) => {
      if (error) throw error
    }
  )
}

async function deleteReportsGroupsFromUsersGroup(usersGroupId) {
  connection.query(
    usersGroupsQueries.DELETE_REPORTS_GROUPS_FROM_USERS_GROUP,
    [usersGroupId],
    (error, result) => {
      if (error) throw error
    }
  )
}

async function deleteSectionsFromUsersGroup(usersGroupId) {
  connection.query(
    usersGroupsQueries.DELETE_SECTIONS_FROM_USERS_GROUP,
    [usersGroupId],
    (error, result) => {
      if (error) throw error
    }
  )
}

module.exports = {
  createUsersGroup,

  addUsersToUsersGroup,
  addReportsGroupsToUsersGroup,
  addSectionsToUsersGroup,

  readUsersGroups,
  readUsersGroupsUsers,
  readUsersGroupsReportsGroups,
  readUsersGroupsSections,
  readIndependentSectionsIds,

  updateUsersGroup,

  deleteUsersFromUsersGroup,
  deleteReportsGroupsFromUsersGroup,
  deleteSectionsFromUsersGroup,
}
