const powerBiRepository = require('../common/powerbi.repository')

exports.readSectionsByReport = async report => {
  const response = await powerBiRepository.read(`/reports/${report.id}/pages`)

  const sections = response.value.map(section => ({
    ...section,
    name: section.displayName,
    reportIdPBI: report.id,
    reportId: report.id,
    reportName: report.name,
    workspaceId: report.workspaceId,
    workspaceName: report.workspaceName,
    pbiSectionId: section.Name,
    id: section.name,
    displayName: section.displayName,
  }))

  return sections
}

exports.readSectionsByManyReports = async reports => {
  return (
    await Promise.all(
      reports.map(async report => await exports.readSectionsByReport(report))
    )
  ).flat(2)
}
