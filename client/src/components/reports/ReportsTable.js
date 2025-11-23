import React from 'react'
import ReportsTableRow from './ReportsTableRow'
import useResponsive from './../../hooks/useResponsive'

import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  TableBody,
} from '@mui/material'

const ReportsTable = ({ reports }) => {
  const headersMd = ['Workspace', 'Reporte', 'Sección', 'Activo']

  const headersXs = ['Reporte', 'Sección', 'Activo']

  const matchMd = useResponsive('md')

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
                align='center'
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {reports.map(report => (
            <ReportsTableRow key={report.sectionId} report={report} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ReportsTable
