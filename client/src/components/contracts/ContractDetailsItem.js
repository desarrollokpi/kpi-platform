import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TextField from '@mui/material/TextField'

import { updateContractDetail } from '../../state/contracts/contractsActions'
import useForm from './../../hooks/useForm'

const ContractDetail = ({ contractDetail }) => {
  const dispatch = useDispatch()
  const [quantity, setQuantity] = useState(contractDetail.quantity)

  const handleQuantityChange = e => {
    if (e.target.value > 0) setQuantity(e.target.value)
  }

  // useEffect(() => {
  //   dispatch(updateContractDetail({ ...contractDetail, quantity }))
  // }, [quantity])

  const totalValue = (cost, quantity) => (cost * quantity).toFixed(2)

  return (
    <TableRow>
      <TableCell align='center'>{contractDetail.name}</TableCell>
      <TableCell align='center'>{contractDetail.cost}</TableCell>
      <TableCell align='center'>
        {/*contractDetail.quantity*/}
        <TextField
          type='number'
          sx={{ maxWidth: '70px' }}
          size='small'
          value={quantity}
          onChange={handleQuantityChange}
        />
      </TableCell>
      <TableCell align='center'>
        {totalValue(contractDetail.cost, quantity)}
      </TableCell>
    </TableRow>
  )
}

export default ContractDetail
