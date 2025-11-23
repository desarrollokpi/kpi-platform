import React from 'react'

import Typography from '@mui/material/Typography'
import TableContainer from '@mui/material/TableContainer'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Paper from '@mui/material/Paper'
import TableBody from '@mui/material/TableBody'

import UsersGroupsReportsGroupsTableRow from './UsersGroupsReportsGroupsTableRow'

import useResponsive from './../../hooks/useResponsive'

const UsersGroupsReportsGroups = ({
  reportsGroups,
  onChange,
  readOnly,
  selectedReportsGroups,
}) => {
  const matchMd = useResponsive('md')

  const checkboxHeader = readOnly ? [] : ['']

  const headersMd = [
    ...checkboxHeader,
    'Código',
    'Nombre',
    'Secciones',
    'Activo',
  ]

  const headersXs = [...checkboxHeader, 'Grupo', 'Activo']

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
          {reportsGroups.map(reportsGroup => (
            <UsersGroupsReportsGroupsTableRow
              onChange={onChange}
              readOnly={readOnly}
              key={reportsGroup.id}
              reportsGroup={reportsGroup}
              selectedReportsGroups={selectedReportsGroups}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default UsersGroupsReportsGroups
