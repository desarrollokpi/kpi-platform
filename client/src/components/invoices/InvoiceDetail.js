import React from 'react'
import { useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Table from '@mui/material/Table'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'
import InvoiceDetailItem from './InvoiceDetailItem'
import Loading from './../layout/Loading'

const InvoiceDetail = ({ invoice }) => {
  const { invoiceDetails, loading } = useSelector(state => state.invoices)

  if (loading && invoiceDetails.length === 0) return <Loading />

  const thisInvoiceDetails = invoiceDetails.filter(
    invoiceDetail => invoiceDetail.invoiceId === invoice.id
  )

  const invoiceTotal = () =>
    thisInvoiceDetails
      .map(invoiceDetail => invoiceDetail.totalValue)
      .reduce((acc, value) => acc + value, 0)

  const headers = ['Item', 'Valor', 'Cantidad', 'Total']

  return (
    <Box my={1} mb={3}>
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
            {thisInvoiceDetails.map(invoiceDetail => (
              <InvoiceDetailItem
                key={invoiceDetail.id}
                invoiceDetail={invoiceDetail}
              />
            ))}

            <TableRow>
              <TableCell colSpan={2} align='right' />

              <TableCell sx={{ fontWeight: 'bold' }} align='center'>
                Total Contrato:
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align='center'>
                {invoiceTotal()}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default InvoiceDetail
