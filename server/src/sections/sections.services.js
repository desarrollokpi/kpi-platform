const sectionsRepository = require('./sections.repository')
const reportsServices = require('../reports/reports.services')
const sectionsPowerBiRepository = require('./sections.powerbi.repository')

function stringifySectionKey(section) {
  return JSON.stringify({
    sectionId: section.sectionId || section.id,
    reportId: section.reportId,
  })
}

function stringifySectionsKeys(sections) {
  return sections.map(section => stringifySectionKey(section))
}

async function reconcileSections(adminId, powerBiSections, databaseSections) {
  const databaseSectionsIds = stringifySectionsKeys(databaseSections)
  const powerBiSectionsIds = stringifySectionsKeys(powerBiSections)

  const sectionsAreEqual =
    databaseSectionsIds.every(databaseSectionId =>
      powerBiSectionsIds.includes(databaseSectionId)
    ) && !databaseSectionsIds.length === 0

  if (!sectionsAreEqual) {
    console.log('powerBiSections', powerBiSections)
    
    powerBiSections.forEach(async powerBiSection => {
      if (!databaseSectionsIds.includes(stringifySectionKey(powerBiSection)))
        await sectionsRepository.createSectionByAdmin(
          adminId,
          powerBiSection.id,
          powerBiSection.reportId
        )
    })

    databaseSections.forEach(async databaseSection => {
      if (!powerBiSectionsIds.includes(stringifySectionKey(databaseSection))) {
        await sectionsRepository.deleteSectionByAdmin(
          adminId,
          databaseSection.sectionId,
          databaseSection.reportId
        )
      }
    })
  }
}

exports.readSectionsByAdmin = async adminId => {
  const reports = await reportsServices.readReportsByAdmin(adminId)

  const powerBiSections =
    await sectionsPowerBiRepository.readSectionsByManyReports(reports)
  const databaseSections = await sectionsRepository.readSectionsByAdmin(adminId)

  await reconcileSections(adminId, powerBiSections, databaseSections)

  const sections = databaseSections.map(databaseSection => ({
    ...databaseSection,
    ...powerBiSections.find(
      powerBiSection =>
        powerBiSection.id === databaseSection.sectionId &&
        powerBiSection.reportId === databaseSection.reportId
    ),
    sectionId: undefined,
  }))

  return sections
}

exports.readSectionsByReport = async (workspaceId, reportId) => {
  return await sectionsPowerBiRepository.readSectionsByReport(
    workspaceId,
    reportId
  )
}

exports.readSectionsByReportGroup = async reportGroupId => {
  return await sectionsRepository.readSectionsByReportGroup(reportGroupId)
}

exports.readSectionsByUser = async (userId, adminId) => {
  const adminSections = await exports.readSectionsByAdmin(adminId)
  const databaseUserSections = await sectionsRepository.readSectionsByUser(
    userId
  )

  const sections = databaseUserSections.map(databaseUserSection => ({
    ...databaseUserSection,
    ...adminSections.find(
      section =>
        section.id === databaseUserSection.sectionId &&
        section.reportId === databaseUserSection.reportId
    ),
  }))

  return sections
}
