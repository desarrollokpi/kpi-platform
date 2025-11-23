import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Table from '@mui/material/Table'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'

import ContractDetailsItem from './ContractDetailsItem'

import { readContractDetailsByAdmin } from '../../state/contracts/contractsActions'

const ContractDetail = ({ contract }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(readContractDetailsByAdmin(contract))
  }, [])

  const { contractDetails, loading } = useSelector(state => state.contracts)

  const contractTotal = () =>
    contractDetails
      .map(contractDetail => contractDetail.quantity * contractDetail.cost)
      .reduce((acc, value) => acc + value, 0)

  const headers = ['Item', 'Valor', 'Cantidad', 'Total']

  return (
    <Box my={2} mt={4}>
      <Typography mb={3} variant='h6'>
        Items Contratados
      </Typography>

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
            {contractDetails.map(contractDetail => (
              <ContractDetailsItem
                key={contractDetail.id}
                contractDetail={contractDetail}
              />
            ))}

            <TableRow>
              <TableCell colSpan={2} align='right' />

              <TableCell sx={{ fontWeight: 'bold' }} align='center'>
                Total
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align='center'>
                {contractTotal()}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default ContractDetail
