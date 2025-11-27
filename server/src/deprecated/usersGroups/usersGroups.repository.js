const { poolConnection } = require('../../../database')
const usersGroupsQueries = require('./usersGroups.queries')

async function createUsersGroup(code, name, active) {
  const [result] = await poolConnection.query(usersGroupsQueries.CREATE_USERS_GROUP, [
    code,
    name,
    active,
  ])

  return result.insertId
}

async function addUsersToUsersGroup(usersGroupId, users) {
  const usersGroupUsers = users.map(userId => [usersGroupId, userId])

  await poolConnection.query(usersGroupsQueries.ADD_USERS_TO_USERS_GROUP, [usersGroupUsers])
}

async function addReportsGroupsToUsersGroup(usersGroupId, reportsGroups) {
  const usersGroupReportsGroups = reportsGroups.map(reportsGroupId => [
    usersGroupId,
    reportsGroupId,
  ])

  await poolConnection.query(usersGroupsQueries.ADD_REPORTS_GROUPS_TO_USERS_GROUP, [usersGroupReportsGroups])
}

async function addSectionsToUsersGroup(usersGroupId, sections) {
  const usersGroupSections = sections.map(sectionId => [
    usersGroupId,
    sectionId,
  ])

  await poolConnection.query(usersGroupsQueries.ADD_SECTIONS_TO_USERS_GROUP, [usersGroupSections])
}

async function readUsersGroups(adminId) {
  const [rows] = await poolConnection.query(usersGroupsQueries.READ_USERS_GROUPS, [adminId])
  return rows
}

async function readUsersGroupsUsers(adminId, usersGroupId) {
  const [rows] = await poolConnection.query(
    { sql: usersGroupsQueries.READ_USERS_GROUPS_USERS, rowsAsArray: true },
    [adminId, usersGroupId]
  )

  return rows.flat()
}

async function readUsersGroupsReportsGroups(adminId, usersGroupId) {
  const [rows] = await poolConnection.query(
    { sql: usersGroupsQueries.READ_USERS_GROUPS_REPORTS_GROUPS, rowsAsArray: true },
    [adminId, usersGroupId]
  )

  return rows.flat()
}

async function readUsersGroupsSections(adminId, usersGroupId) {
  const [rows] = await poolConnection.query(
    { sql: usersGroupsQueries.READ_USERS_GROUPS_SECTIONS, rowsAsArray: true },
    [adminId, usersGroupId]
  )

  return rows.flat()
}

async function readIndependentSectionsIds(adminId, usersIds, reportsGroupsIds) {
  const [rows] = await poolConnection.query(
    { sql: usersGroupsQueries.READ_INDEPENDENT_SECTIONS_IDS, rowsAsArray: true },
    [adminId, [usersIds], [reportsGroupsIds]]
  )

  return rows.flat()
}

async function updateUsersGroup(code, name, active, usersGroupId) {
  await poolConnection.query(usersGroupsQueries.UPDATE_USERS_GROUP, [code, name, active, usersGroupId])
}

async function deleteUsersFromUsersGroup(usersGroupId) {
  await poolConnection.query(usersGroupsQueries.DELETE_USERS_FROM_USERS_GROUP, [usersGroupId])
}

async function deleteReportsGroupsFromUsersGroup(usersGroupId) {
  await poolConnection.query(usersGroupsQueries.DELETE_REPORTS_GROUPS_FROM_USERS_GROUP, [usersGroupId])
}

async function deleteSectionsFromUsersGroup(usersGroupId) {
  await poolConnection.query(usersGroupsQueries.DELETE_SECTIONS_FROM_USERS_GROUP, [usersGroupId])
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
