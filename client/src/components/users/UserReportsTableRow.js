import React from 'react'

import { TableCell, TableRow } from '@mui/material'
import ActiveIndicator from '../layout/ActiveIndicator'
import useResponsive from './../../hooks/useResponsive'
import { useSelector } from 'react-redux'

const UserReportsTableRow = ({ reportGroupId }) => {
  const matchMd = useResponsive('md')

  const { reportsGroups } = useSelector(state => state.reports)

  const thisReportGroup = reportsGroups.find(
    reportGroup => reportGroup.id === reportGroupId
  )

  return (
    <TableRow>
      {matchMd && <TableCell align='center'>{thisReportGroup.code}</TableCell>}

      <TableCell align='center'>{thisReportGroup.name}</TableCell>
      {matchMd && (
        <>
          <TableCell align='center'>
            {thisReportGroup.sections.length}
          </TableCell>
          <TableCell align='center'>
            <ActiveIndicator active={thisReportGroup.active} />
          </TableCell>
        </>
      )}
    </TableRow>
  )
}

export default UserReportsTableRow
