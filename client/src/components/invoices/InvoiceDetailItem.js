import React from 'react'

import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TextField from '@mui/material/TextField'

const InvoiceDetailItem = ({ invoiceDetail }) => {
  return (
    <TableRow>
      <TableCell align='center'>{invoiceDetail.name}</TableCell>
      <TableCell align='center'>{invoiceDetail.cost}</TableCell>
      <TableCell align='center'>{invoiceDetail.quantity}</TableCell>
      <TableCell align='center'>{invoiceDetail.totalValue}</TableCell>
    </TableRow>
  )
}

export default InvoiceDetailItem
