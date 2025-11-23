import React from 'react'

import { TableCell, TableRow, Checkbox } from '@mui/material'
import ActiveIndicator from '../layout/ActiveIndicator'
import useResponsive from '../../hooks/useResponsive'

const UsersGroupsUsersTableRow = ({
  user,
  onChange,
  readOnly,
  selectedUsers,
}) => {
  const matchMd = useResponsive('md')

  return (
    <TableRow>
      {!readOnly && (
        <TableCell align='center'>
          <Checkbox
            sx={{ padding: 0, margin: 0 }}
            onChange={onChange(user.id)}
            checked={selectedUsers.includes(user.id)}
          />
        </TableCell>
      )}

      <TableCell align='center'>{user.name}</TableCell>

      <TableCell align='center'>{user.username}</TableCell>

      {matchMd && (
        <>
          <TableCell align='center'>{user.mail}</TableCell>
          <TableCell align='center'>
            <ActiveIndicator active={user.active} />
          </TableCell>
        </>
      )}
    </TableRow>
  )
}

export default UsersGroupsUsersTableRow
