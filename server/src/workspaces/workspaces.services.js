const workspacesRepository = require('./workspaces.repository')
const workspacesPowerBiRepository = require('./workspaces.powerbi.repository')

exports.readWorkspacesByAdmin = async adminId => {
  const workspaces = await workspacesRepository.readWorkspacesByAdmin(adminId)

  return await workspacesPowerBiRepository.readWorkspaces(workspaces)
}

exports.readWorkspacesByUser = async (userId, adminId) => {
  const adminWorkspaces = await exports.readWorkspacesByAdmin(adminId)

  const databaseUserWorkspaces =
    await workspacesRepository.readWorkspacesByUser(userId)

  const workspaces = databaseUserWorkspaces.map(databaseUserWorkspace => ({
    ...adminWorkspaces.find(
      workspace => workspace.id === databaseUserWorkspace
    ),
  }))

  return workspaces
}
