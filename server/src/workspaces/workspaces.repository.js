const connection = require('../../database')
const workspacesQueries = require('./workspaces.queries')

exports.readWorkspacesByAdmin = async adminId => {
  return new Promise(resolve => {
    connection.query(
      workspacesQueries.READ_WORKSPACES_BY_ADMIN,
      [adminId],
      (error, results) => {
        if (error) throw error

        resolve(results.map(result => result.workspaceId))
      }
    )
  })
}

exports.readWorkspacesByUser = async userId => {
  return new Promise(resolve => {
    connection.query(
      workspacesQueries.READ_WORKSPACES_BY_USER,
      [userId],
      (error, results) => {
        if (error) throw error

        resolve(results.map(result => result.workspaceId))
      }
    )
  })
}
