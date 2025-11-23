import { useSelector } from 'react-redux'

const useReportsByWorkspace = workspaceCode => {
  const { reports } = useSelector(state => state.reports)

  const thisWorkspaceReports = reports
    .filter(report => report.groupIdPBI === workspaceCode)
    .map(report => ({
      id: report.id,
      reportIdPBI: report.reportIdPBI,
      name: report.name,
    }))
    .filter(
      (value, index, self) =>
        index ===
        self.findIndex(t => t.place === value.place && t.name === value.name)
    )

  return thisWorkspaceReports
}

export default useReportsByWorkspace
