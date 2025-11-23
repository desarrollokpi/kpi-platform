const usersRepository = require('./users.repository')
const UsersException = require('./users.exception')
const roles = require('./../constants/roles')
const encrypt = require('../common/encrypt')

function reportGroupsByUser(reportGroups, userId) {
  return reportGroups
    .filter(reportGroup => reportGroup.userId === userId)
    .map(reportGroup => reportGroup.reportGroupId)
}

// Admin
async function linkReportGroupsToUser(userId, reportGroups) {
  await usersRepository.deleteReportGroupsInUser(userId)
  await usersRepository.createReportGroupsInUser(userId, reportGroups)
}

exports.createUserByAdmin = async (user, reportGroups, adminId) => {
  const hashedPassword = await encrypt.hash(user.password)

  const userId = await usersRepository.createUserByAdmin({
    ...user,
    password: hashedPassword,
  }, adminId)

  await linkReportGroupsToUser(userId, reportGroups)
}

exports.readUsersByAdminId = async adminId => {
  const users = await usersRepository.readUsersByAdminId(adminId)

  const reportGroups = await usersRepository.readUsersReportsGroupsByAdmin(
    adminId
  )

  const usersWithReportGroups = users.map(user => ({
    ...user,
    reportGroups: reportGroupsByUser(reportGroups, user.id),
  }))

  return usersWithReportGroups
}

exports.readOneUserByAdmin = async (userId, adminId) => {
  const users = await exports.readUsersByAdminId(adminId)

  return users.find(user => user.id === userId)
}

exports.connectUserToReportGroups = async (userId, reportGroupsIds) => {
  await usersRepository.connectUserToReportGroups(userId, reportGroupsIds)
}

exports.updateConnectionUserToReportGroup = async (userId, reportGroupsIds) => {
  await usersRepository.deleteConnectionUserToReportGroups(userId)
  await usersRepository.connectUserToReportGroups(userId, reportGroupsIds)
}

exports.updateUserByAdmin = async (
  adminId,
  userId,
  username,
  name,
  mail,
  active,
  reportGroups
) => {
  await usersRepository.updateUserByAdmin(
    adminId,
    userId,
    username,
    name,
    mail,
    active
  )

  await linkReportGroupsToUser(userId, reportGroups)
}

exports.updateUserPasswordByUser = async (userId, newPassword) => {
  const hashedPassword = await encrypt.hash(newPassword)

  await usersRepository.updateUserPasswordByUser(userId, hashedPassword)
}

// Users
exports.readProfile = async userId => {
  const profile = await usersRepository.readProfile(userId)

  profile.role = roles.USER

  return profile
}

// deprecated
// exports.readSubdomain = async subdomain => {
//   const profile = await usersRepository.readSubdomain(subdomain)

//   return profile
// }
