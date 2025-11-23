const connection = require('../../database')
const sectionsQueries = require('./sections.queries')

exports.createSectionByAdmin = async (adminId, sectionId, reportId) => {
  connection.query(
    sectionsQueries.CREATE_SECTION_BY_ADMIN,
    [adminId, sectionId, reportId],
    (error, result) => {
      if (error) throw error
    }
  )
}

exports.readSectionsByAdmin = async adminId => {
  return new Promise(resolve => {
    connection.query(
      sectionsQueries.READ_SECTIONS_BY_ADMIN,
      [adminId],
      (error, result) => {
        if (error) throw error

        return resolve(result)
      }
    )
  })
}

exports.readSectionsByUser = async userId => {
  return new Promise(resolve => {
    connection.query(
      sectionsQueries.READ_SECTIONS_BY_USER,
      [userId],
      (error, result) => {
        if (error) throw error

        return resolve(result)
      }
    )
  })
}

exports.readSectionsByReportGroup = async reportGroupId => {
  return new Promise(resolve => {
    connection.query(
      sectionsQueries.READ_SECTIONS_BY_REPORT_GROUP,
      [reportGroupId],
      (error, result) => {
        if (error) throw error

        return resolve(result)
      }
    )
  })
}

exports.deleteSectionByAdmin = async (adminId, sectionId, reportId) => {
  connection.query(
    sectionsQueries.DELETE_SECTION_BY_ADMIN,
    [adminId, sectionId, reportId],
    (error, _) => {
      if (error) throw error
    }
  )
}
