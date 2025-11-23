import React from 'react'

import Typography from '@mui/material/Typography'
import TableContainer from '@mui/material/TableContainer'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Paper from '@mui/material/Paper'
import TableBody from '@mui/material/TableBody'

import UsersGroupsUsersTableRow from './UsersGroupsUsersTableRow'

import useResponsive from './../../hooks/useResponsive'

const UsersGroupsUsers = ({ users, onChange, readOnly, selectedUsers }) => {
  const matchMd = useResponsive('md')

  const checkboxHeader = readOnly ? [] : ['Seleccionar']

  const headersMd = [...checkboxHeader, 'Nombre', 'Usuario', 'Email', 'Activo']

  const headersXs = [...checkboxHeader, 'Nombre', 'Usuario']

  const headers = matchMd ? headersMd : headersXs

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 248, overflow: 'auto' }}>
      <Table stickyHeader size='small'>
        <TableHead>
          <TableRow sx={{ fontWeight: 'bold' }}>
            {headers.map(header => (
              <TableCell
                key={header}
                sx={{ fontWeight: 'bold' }}
                align='center'
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {users.map(user => (
            <UsersGroupsUsersTableRow
              onChange={onChange}
              selectedUsers={selectedUsers}
              readOnly={readOnly}
              key={user.id}
              user={user}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default UsersGroupsUsers
