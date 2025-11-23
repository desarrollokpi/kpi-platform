const connection = require('../../database')
const usersQueries = require('./users.queries')

exports.createUserByAdmin = async (user, adminId) => {
  return new Promise(resolve => {
    connection.query(
      usersQueries.CREATE_USER_BY_ADMIN,
      [
        adminId,
        user.username,
        user.name,
        user.mail,
        user.password,
        user.active,
      ],
      (error, result) => {
        if (error) throw error

        return resolve(result.insertId)
      }
    )
  })
}

exports.createReportGroupsInUser = async (userId, reportGroups) => {
  const mappedReportGroups = reportGroups.map(reportGroup => [
    userId,
    reportGroup,
  ])

  connection.query(
    usersQueries.CREATE_REPORT_GROUPS_IN_USER,
    [mappedReportGroups],
    (error, result) => {
      if (error) throw error
    }
  )
}

exports.readProfile = async userId => {
  return new Promise(resolve => {
    connection.query(usersQueries.READ_PROFILE, [userId], (error, result) => {
      if (error) throw error

      const user = result.pop()

      return resolve(user)
    })
  })
}

exports.readSubdomain = async subdomain => {
  return new Promise(resolve => {
    connection.query(
      usersQueries.READ_USERS_WORKSPACE,
      [subdomain],
      (error, result) => {
        if (error) throw error

        const user = result

        return resolve(user)
      }
    )
  })
}

exports.readByName = async name => {
  return new Promise((resolve, reject) =>
    connection.query(
      usersQueries.READ_BY_NAME,
      [name],
      async (error, result) => {
        if (error) throw reject(error)

        const user = result.pop()

        return resolve(user)
      }
    )
  )
}

exports.readUsersByAdminId = async adminId => {
  return new Promise(resolve => {
    connection.query(
      usersQueries.READ_USERS_BY_ADMIN_ID,
      [adminId],
      (error, result) => {
        if (error) throw error

        return resolve(result)
      }
    )
  })
}

exports.readUsersReportsGroupsByAdmin = async adminId => {
  return new Promise(resolve => {
    connection.query(
      usersQueries.READ_USER_REPORTS_GROUPS_BY_ADMIN,
      [adminId],
      (error, result) => {
        if (error) throw error

        return resolve(result)
      }
    )
  })
}

exports.updateUserPasswordByUser = async (userId, newPassword) => {
  connection.query(
    usersQueries.UPDATE_PASSWORD_BY_USER,
    [newPassword, userId],
    (error, result) => {
      if (error) throw error
    }
  )
}

exports.updateUserByAdmin = async (
  adminId,
  userId,
  username,
  name,
  mail,
  active
) => {
  connection.query(
    usersQueries.UPDATE_USER_BY_ADMIN,
    [username, name, mail, active, userId, adminId],
    (error, result) => {
      if (error) throw error
    }
  )
}

exports.connectUserToReportGroups = async (userId, reportGroupsIds) => {
  const values = reportGroupsIds.map(id => [userId, id])

  connection.query(
    usersQueries.CONNECT_USER_TO_REPORT_GROUPS,
    [values],
    async error => {
      if (error) throw error
    }
  )
}

exports.deleteConnectionUserToReportGroups = async userId => {
  connection.query(
    usersQueries.DELETE_CONNECTION_USER_TO_REPORT_GROUPS,
    [userId],
    async error => {
      if (error) throw error
    }
  )
}

exports.deleteReportGroupsInUser = async userId => {
  connection.query(
    usersQueries.DELETE_REPORT_GROUPS_IN_USER,
    [userId],
    (error, _) => {
      if (error) throw error
    }
  )
}
