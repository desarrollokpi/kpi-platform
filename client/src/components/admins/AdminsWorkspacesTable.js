import React from 'react'
import AdminsWorkspacesTableRow from './AdminsWorkspacesTableRow'

import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  TableBody,
} from '@mui/material'
import useResponsive from './../../hooks/useResponsive'

const AdminsWorkspacesTable = ({ admin }) => {
  const matchMd = useResponsive('md')

  const headersMd = ['ID', 'Nombre']

  const headersXs = ['ID', 'Nombre']

  const headers = matchMd ? headersMd : headersXs

  return (
    <TableContainer component={Paper} sx={{ maxWidth: '500px' }}>
      <Table size='small'>
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
          {admin.workspaces.map(workspace => (
            <AdminsWorkspacesTableRow
              key={workspace.id}
              workspace={workspace}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default AdminsWorkspacesTable
