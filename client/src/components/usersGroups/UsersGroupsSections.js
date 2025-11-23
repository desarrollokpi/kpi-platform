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

import useResponsive from '../../hooks/useResponsive'
import UsersGroupsSectionsTableRow from './UsersGroupsSectionsTableRow'

const UsersGroupsSections = ({
  sections,
  onChange,
  readOnly,
  selectedSections,
}) => {
  const matchMd = useResponsive('md')

  const checkboxHeader = readOnly ? [] : ['']

  const headersMd = [
    ...checkboxHeader,
    'Workspace',
    'Reporte',
    'Sección',
    'Activo',
  ]

  const headersXs = [...checkboxHeader, 'Reporte', 'Sección', 'Activo']

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
          {sections.map(section => (
            <UsersGroupsSectionsTableRow
              onChange={onChange}
              readOnly={readOnly}
              selectedSections={selectedSections}
              key={section.id}
              section={section}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default UsersGroupsSections
