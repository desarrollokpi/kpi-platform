const connection = require('../../database')
const reportsQueries = require('./reports.queries')

exports.createReportByAdmin = async (adminId, reportId, workspaceId) => {
  connection.query(
    reportsQueries.CREATE_REPORT_BY_ADMIN,
    [reportId, workspaceId, adminId],
    (error, result) => {
      if (error) throw error
    }
  )
}

exports.createReportGroupByAdmin = async (adminId, code, name, active) => {
  return new Promise(resolve => {
    connection.query(
      reportsQueries.CREARE_REPORT_GROUP_BY_ADMIN,
      [adminId, code, name, active],
      (error, result) => {
        if (error) throw error

        resolve(result.insertId)
      }
    )
  })
}

exports.createSectionsInReportGroup = async (reportGroupId, sections) => {
  const mappedSections = sections.map(section => [
    reportGroupId,
    section.sectionId,
    section.reportId,
  ])

  connection.query(
    reportsQueries.CREATE_SECTIONS_IN_REPORT_GROUP,
    [mappedSections],
    (error, result) => {
      if (error) throw error
    }
  )
}

exports.readReportGroupsByAdmin = async adminId => {
  return new Promise(resolve => {
    connection.query(
      reportsQueries.READ_REPORT_GROUPS_BY_ADMIN,
      [adminId],
      (error, result) => {
        if (error) throw error

        resolve(result)
      }
    )
  })
}

exports.readReportsByUser = async userId => {
  return new Promise(resolve => {
    connection.query(
      reportsQueries.READ_REPORTS_BY_USER,
      [userId],
      (error, result) => {
        if (error) throw error

        resolve(result)
      }
    )
  })
}

exports.readReportsByAdmin = async adminId => {
  return new Promise(resolve => {
    connection.query(
      reportsQueries.READ_REPORTS_BY_ADMIN,
      [adminId],
      (error, result) => {
        if (error) throw error

        resolve(result)
      }
    )
  })
}

exports.readUsersReportsByAdmin = async adminId => {
  return new Promise(resolve => {
    connection.query(
      reportsQueries.READ_USERS_REPORTS_BY_ADMIN,
      [adminId],
      (error, result) => {
        if (error) throw error

        resolve(result)
      }
    )
  })
}

exports.updateReportActiveStateByAdmin = async (
  adminId,
  reportId,
  active,
  workspaceId
) => {
  connection.query(
    reportsQueries.UPDATE_REPORT_ACTIVE_STATE_BY_ADMIN,
    [active, adminId, reportId, workspaceId],
    (error, result) => {
      if (error) throw error
    }
  )
}

exports.updateReportGroupByAdmin = async (
  adminId,
  reportGroupId,
  code,
  name,
  active
) => {
  connection.query(
    reportsQueries.UPDATE_REPORT_GROUP_BY_ADMIN,
    [code, name, active, adminId, reportGroupId],
    (error, result) => {
      if (error) throw error
    }
  )
}

exports.deleteReportByAdmin = async (reportId, workspaceId, adminId) => {
  connection.query(
    reportsQueries.DELETE_REPORT_BY_ADMIN,
    [reportId, workspaceId, adminId],
    (error, _) => {
      if (error) throw error
    }
  )
}

exports.deleteSectionsInReportGroup = async reportGroupId => {
  connection.query(
    reportsQueries.DELETE_SECTIONS_IN_REPORT_GROUP,
    [reportGroupId],
    (error, _) => {
      if (error) throw error
    }
  )
}
