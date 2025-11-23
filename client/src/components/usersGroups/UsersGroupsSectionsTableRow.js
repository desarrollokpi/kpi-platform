import React from 'react'

import { TableCell, TableRow, Checkbox } from '@mui/material'
import ActiveIndicator from '../layout/ActiveIndicator'
import useResponsive from '../../hooks/useResponsive'

const UsersGroupsSectionsTableRow = ({
  section,
  onChange,
  readOnly,
  selectedSections,
}) => {
  const matchMd = useResponsive('md')

  return (
    <TableRow>
      {!readOnly && (
        <TableCell align='center'>
          <Checkbox
            sx={{ padding: 0, margin: 0 }}
            onChange={onChange(section.id)}
            checked={selectedSections.includes(section.id)}
          />
        </TableCell>
      )}

      {matchMd && <TableCell align='center'>{section.workspaceName}</TableCell>}

      <TableCell align='center'>{section.reportName}</TableCell>

      <TableCell align='center'>{section.name}</TableCell>
      <TableCell align='center'>
        <ActiveIndicator active={section.reportActive} />
      </TableCell>
    </TableRow>
  )
}

export default UsersGroupsSectionsTableRow
