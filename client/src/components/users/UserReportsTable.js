import React from 'react'
import UserReportsTableRow from './UserReportsTableRow'

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

const UserReportsTable = ({ user }) => {
  const matchMd = useResponsive('md')

  const headersMd = ['Código', 'Nombre Grupo', 'Secciones', 'Activo']

  const headersXs = ['Nombre Grupo']

  const headers = matchMd ? headersMd : headersXs

  return (
    <TableContainer component={Paper}>
      <Table size='small'>
        <TableHead>
          <TableRow sx={{ fontWeight: 'bold' }}>
            {headers.map(header => (
              <TableCell
                key={header}
                sx={{ fontWeight: 'bold' }}
                align={header !== 'Nombre' ? 'center' : ''}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {user.reportGroups.map(reportGroupId => (
            <UserReportsTableRow
              key={reportGroupId}
              reportGroupId={reportGroupId}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default UserReportsTable
