const sectionsServices = require('../sections/sections.services')
const reportsRepository = require('./reports.repository')
const workspaceService = require('../workspaces/workspaces.services')
const reportsPowerBiRepository = require('./reports.powerbi.repository')

function sectionsByReportsGroupHeader(sections, reportsGroupHeaderId) {
  return sections
    .filter(section => section.reportsGroupHeaderId === reportsGroupHeaderId)
    .map(section => section.id)
}

async function reconcileReports(
  adminId,
  workspaces,
  powerBiReports,
  databaseReports
) {
  const databaseReportsIds = databaseReports.map(report => report.reportId)
  const powerBiReportsIds = powerBiReports.map(report => report.id)

  const reportsAreEqual =
    databaseReportsIds.every(databaseReportId =>
      powerBiReportsIds.includes(databaseReportId)
    ) && !databaseReportsIds.length === 0

  if (!reportsAreEqual) {
    powerBiReports.forEach(async powerBiReport => {
      if (!databaseReportsIds.includes(powerBiReport.id))
        await reportsRepository.createReportByAdmin(
          adminId,
          powerBiReport.id,
          powerBiReport.workspaceId
        )
    })

    databaseReports.forEach(async databaseReport => {
      if (!powerBiReportsIds.includes(databaseReport.reportId))
        await reportsRepository.deleteReportByAdmin(
          databaseReport.reportId,
          databaseReport.workspaceId,
          adminId
        )
    })
  }
}

async function linkSectionsToReportGroup(reportGroupId, sections) {
  await reportsRepository.deleteSectionsInReportGroup(reportGroupId)
  await reportsRepository.createSectionsInReportGroup(reportGroupId, sections)
}

exports.createReportGroupByAdmin = async (
  adminId,
  code,
  name,
  active,
  sections
) => {
  const reportGroupId = await reportsRepository.createReportGroupByAdmin(
    adminId,
    code,
    name,
    active
  )

  await linkSectionsToReportGroup(reportGroupId, sections)
}

exports.readReportGroupsByAdmin = async adminId => {
  const reportGroups = await reportsRepository.readReportGroupsByAdmin(adminId)

  const reportGroupsWithSections = Promise.all(
    reportGroups.map(async reportGroup => ({
      ...reportGroup,
      sections: await sectionsServices.readSectionsByReportGroup(
        reportGroup.id
      ),
    }))
  )

  return reportGroupsWithSections
}

exports.readReportsByAdmin = async adminId => {
  const workspaces = await workspaceService.readWorkspacesByAdmin(adminId)
  const powerBiReports =
    await reportsPowerBiRepository.readReportsByManyWorkspaces(workspaces)
  const databaseReports = await reportsRepository.readReportsByAdmin(adminId)

  await reconcileReports(adminId, workspaces, powerBiReports, databaseReports)

  const reports = databaseReports.map(databaseReport => ({
    ...databaseReport,
    ...powerBiReports.find(
      powerBiReport => powerBiReport.id === databaseReport.reportId
    ),
    reportId: undefined,
  }))

  return reports
}

exports.readReportsByUser = async (userId, adminId) => {
  const adminReports = await exports.readReportsByAdmin(adminId)
  const databaseUserReports = await reportsRepository.readReportsByUser(userId)

  const reports = databaseUserReports.map(databaseUserReport => ({
    ...databaseUserReport,
    ...adminReports.find(report => report.id === databaseUserReport.reportId),
  }))

  return reports
}

exports.readReportsByWorkspace = async workspaceId => {
  return await reportsPowerBiRepository.readReportsByWorkspace(workspaceId)
}

exports.readUsersReportsByAdmin = async adminId => {
  return await reportsRepository.readUsersReportsByAdmin(adminId)
}

exports.updateReportGroupByAdmin = async (
  adminId,
  reportGroupId,
  code,
  name,
  active,
  sections
) => {
  await reportsRepository.updateReportGroupByAdmin(
    adminId,
    reportGroupId,
    code,
    name,
    active
  )

  await linkSectionsToReportGroup(reportGroupId, sections)
}

exports.updateReportActiveStateByAdmin = async (
  adminId,
  reportId,
  active,
  workspaceId
) => {
  await reportsRepository.updateReportActiveStateByAdmin(
    adminId,
    reportId,
    active,
    workspaceId
  )
}
