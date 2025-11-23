import React from 'react'
import AccountReportsTableRow from './AccountReportsTableRow'

import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  TableBody,
} from '@mui/material'
import { useSelector } from 'react-redux'
import useResponsive from './../../hooks/useResponsive'

import CircularLoading from '@layout/CircularLoading'

const AccountReportsTable = () => {
  const matchMd = useResponsive('md')
  const headersMd = ['Workspace', 'Reporte', 'Activar/Desactivar']
  const headersXs = ['Reporte', 'Activar/Desactivar']

  const headers = matchMd ? headersMd : headersXs

  const { reports, loading } = useSelector(state => state.reports)

  if (loading && reports.length === 0) return <CircularLoading />

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
          {reports.map(report => (
            <AccountReportsTableRow key={report.id} report={report} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default AccountReportsTable
