import { useState } from 'react'

const useSelectReportGroups = initialState => {
  const [selectedReportGroups, setSelectedReportsGroups] =
    useState(initialState)

  const isReportGroupChecked = reportGroupId =>
    selectedReportGroups.includes(reportGroupId)

  const toggleReport = reportGroupId => {
    if (!isReportGroupChecked(reportGroupId)) {
      setSelectedReportsGroups([...selectedReportGroups, reportGroupId])
    } else {
      setSelectedReportsGroups(
        selectedReportGroups.filter(
          reportGroup => reportGroup !== reportGroupId
        )
      )
    }
  }

  return [selectedReportGroups, { isReportGroupChecked, toggleReport }]
}

export default useSelectReportGroups
