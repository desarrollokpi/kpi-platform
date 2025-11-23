const powerBiRepository = require('../common/powerbi.repository')

exports.readReportsByWorkspace = async workspace => {
  const response = await powerBiRepository.read(
    `/groups/${workspace.id}/reports`
  )

  const reports = response.value.map(report => ({
    ...report,
    workspaceId: report.datasetWorkspaceId,
    workspaceName: workspace.name,
    datasetWorkspaceId: undefined,
  }))

  return reports
}

exports.readReportsByManyWorkspaces = async workspaces => {
  return (
    await Promise.all(
      workspaces.map(
        async workspace => await exports.readReportsByWorkspace(workspace)
      )
    )
  ).flat(2)
}
