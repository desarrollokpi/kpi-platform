import React from 'react'
import { useSelector } from 'react-redux'
import VisibilityIcon from '@mui/icons-material/Visibility'

import {
  Grid,
  IconButton,
  Collapse,
  ListItem,
  ListItemText,
  Typography,
  ListItemSecondaryAction,
  Stack,
} from '@mui/material'

import DayJS from 'react-dayjs'
import InvoiceDetail from './InvoiceDetail'
import useResponsive from './../../hooks/useResponsive'
import useToggle from './../../hooks/useToggle'

const InvoiceItem = ({ invoice }) => {
  const matchMd = useResponsive('md')
  const [open, handleToggleCollapse] = useToggle(false)
  const { currencies } = useSelector(state => state.currencies)

  const thisInvoiceCurrency = currencies.find(
    currency => currency.id === invoice.currencyId
  )

  return (
    <>
      <ListItem dense>
        <Grid container alignItems='center' justifyContent='space-around'>
          <Grid item md={3} xs={3}>
            <ListItemText>
              <Typography variant='body1'>{invoice.invoiceId}</Typography>
            </ListItemText>
          </Grid>

          <Grid item md={3} xs={4}>
            <ListItemText>
              <Typography variant='body1'>
                <DayJS format='DD-MM-YYYY'>{invoice.creationDate}</DayJS>
              </Typography>
            </ListItemText>
          </Grid>

          {matchMd && (
            <>
              <Grid item md={2}>
                <ListItemText>
                  <Typography variant='body1'>{invoice.value}</Typography>
                </ListItemText>
              </Grid>

              <Grid item md={1}>
                <ListItemText>
                  <Typography variant='body1'>
                    {thisInvoiceCurrency?.code}
                  </Typography>
                </ListItemText>
              </Grid>
            </>
          )}

          <Grid item md={1} xs={4}>
            <ListItemText>
              <Typography variant='body1'>{invoice.paymentStatus}</Typography>
            </ListItemText>
          </Grid>

          {matchMd && (
            <Grid item md={1} xs={1}>
              <ListItemText>
                <Typography variant='body1'>
                  <DayJS format='DD-MM-YYYY'>{invoice.paymentDate}</DayJS>
                </Typography>
              </ListItemText>
            </Grid>
          )}

          <Grid item md={1} xs={2}>
            <ListItemSecondaryAction>
              <IconButton onClick={handleToggleCollapse}>
                <VisibilityIcon color='primary' />
              </IconButton>
            </ListItemSecondaryAction>
          </Grid>
        </Grid>
      </ListItem>

      <Collapse in={open} timeout='auto' unmountOnExit>
        {!matchMd && (
          <>
            <Stack direction='row' spacing={2}>
              <Typography variant='accent'>Moneda:</Typography>
              <Typography variant='body1'>
                {thisInvoiceCurrency?.code}
              </Typography>
            </Stack>
            <Stack direction='row' spacing={2}>
              <Typography variant='accent'>Valor:</Typography>
              <Typography variant='body1'>{invoice.value}</Typography>
            </Stack>
            <Stack direction='row' spacing={2}>
              <Typography variant='accent'>Fecha Pago:</Typography>
              <Typography variant='body1'>
                <DayJS format='DD-MM-YYYY'>{invoice.paymentDate}</DayJS>
              </Typography>
            </Stack>
          </>
        )}

        <InvoiceDetail invoice={invoice} />
      </Collapse>
    </>
  )
}

export default InvoiceItem
