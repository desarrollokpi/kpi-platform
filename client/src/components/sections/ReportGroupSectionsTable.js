import React from 'react'
import ReportGroupSectionsTableRow from './ReportGroupSectionsTableRow'
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

const ReportGroupSectionsTable = ({ sections }) => {
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
          {sections.map(section => (
            <ReportGroupSectionsTableRow
              key={section.sectionId}
              section={section}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ReportGroupSectionsTable
