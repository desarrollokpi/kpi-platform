import React from 'react'

import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import IconButton from '@mui/material/IconButton'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import useResponsive from './../../hooks/useResponsive'

import useReadSectionByCompoundId from '../sections/hooks/useReadSectionByCompoundId'

const ManageReportsGroupTableRow = ({ sectionCompoundKey, onChange }) => {
  const section = useReadSectionByCompoundId(JSON.parse(sectionCompoundKey))
  const matchMd = useResponsive('md')

  return (
    <TableRow>
      {matchMd && <TableCell align='center'>{section.workspaceName}</TableCell>}
      <TableCell align='center'>{section.reportName}</TableCell>
      <TableCell align='center'>{section.name}</TableCell>
      <TableCell align='center'>
        <IconButton onClick={onChange(sectionCompoundKey)}>
          <HighlightOffIcon color='error' />
        </IconButton>
      </TableCell>
    </TableRow>
  )
}

export default ManageReportsGroupTableRow
