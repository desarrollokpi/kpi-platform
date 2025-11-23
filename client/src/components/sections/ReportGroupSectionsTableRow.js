import React from 'react'

import { TableCell, TableRow } from '@mui/material'
import ActiveIndicator from './../layout/ActiveIndicator'
import useResponsive from './../../hooks/useResponsive'
import { useSelector } from 'react-redux'

const ReportGroupSectionsTableRow = ({ section }) => {
  const matchMd = useResponsive('md')
  const { sections } = useSelector(state => state.sections)
  const { reports } = useSelector(state => state.reports)

  const thisSection = sections.find(
    stateSection => stateSection.id === section.sectionId
  )

  const thisReport = reports.find(report => report.id === section.reportId)

  return (
    <TableRow>
      {matchMd && (
        <TableCell align='center'>{thisReport.workspaceName}</TableCell>
      )}

      <TableCell align='center'>{thisReport.name}</TableCell>
      <TableCell align='center'>{thisSection.name}</TableCell>
      <TableCell align='center'>
        <ActiveIndicator active={thisReport.active} />
      </TableCell>
    </TableRow>
  )
}

export default ReportGroupSectionsTableRow
