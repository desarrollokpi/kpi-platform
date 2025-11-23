import React from 'react'

import { TableCell, TableRow } from '@mui/material'
import ActiveIndicator from '../layout/ActiveIndicator'
import useResponsive from './../../hooks/useResponsive'
import { useSelector } from 'react-redux'

const UserReportsTableRow = ({ workspace }) => {
  return (
    <TableRow>
      <TableCell align='center'>{workspace.id}</TableCell>
      <TableCell align='center'>{workspace.name}</TableCell>
    </TableRow>
  )
}

export default UserReportsTableRow
