const { poolConnection } = require('../../../database')
const sectionsQueries = require('./sections.queries')

exports.createSectionByAdmin = async (adminId, sectionId, reportId) => {
  await poolConnection.query(sectionsQueries.CREATE_SECTION_BY_ADMIN, [adminId, sectionId, reportId])
}

exports.readSectionsByAdmin = async adminId => {
  const [rows] = await poolConnection.query(sectionsQueries.READ_SECTIONS_BY_ADMIN, [adminId])
  return rows
}

exports.readSectionsByUser = async userId => {
  const [rows] = await poolConnection.query(sectionsQueries.READ_SECTIONS_BY_USER, [userId])
  return rows
}

exports.readSectionsByReportGroup = async reportGroupId => {
  const [rows] = await poolConnection.query(sectionsQueries.READ_SECTIONS_BY_REPORT_GROUP, [reportGroupId])
  return rows
}

exports.deleteSectionByAdmin = async (adminId, sectionId, reportId) => {
  await poolConnection.query(sectionsQueries.DELETE_SECTION_BY_ADMIN, [adminId, sectionId, reportId])
}
