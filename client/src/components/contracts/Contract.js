import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import useForm from './../../hooks/useForm'
import DayJS from 'react-dayjs'

import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import CheckIcon from '@mui/icons-material/Check'

import FormField from './../layout/FormField'
import ContractDetail from './ContractDetail'

import SaveIcon from '@mui/icons-material/Save'

import { updateContract } from '../../state/contracts/contractsActions'

import useTimeout from '@hooks/useTimeout'
import useResponsive from '@hooks/useResponsive'

import CircularLoading from '@layout/CircularLoading'
import InformationItem from '../layout/InformationItem'

const Contract = () => {
  const dispatch = useDispatch()
  const matchMd = useResponsive('md')

  const { contract } = useSelector(state => state.contracts)
  const { countries, regions, zones } = useSelector(state => state.locations)
  const { currencies } = useSelector(state => state.currencies)
  const { identificationDocuments } = useSelector(
    state => state.identificationDocuments
  )

  const [contractFields, bindField, areFieldsEmpty, setFields] = useForm({
    countryId: '',
    regionId: '',
    zoneId: '',
    identificationDocumentValue: '',
    address: '',
    name: '',
  })

  const [feedback, showFeedback] = useTimeout()

  useEffect(() => {
    setFields(contract)
  }, [contract])

  if (
    !contract ||
    regions.length === 0 ||
    countries.length === 0 ||
    zones.length === 0
  )
    return <CircularLoading />

  const thisContractCurrency = currencies.find(
    currency => currency.id === contract.currencyId
  )

  const thisCountryRegions = regions.filter(
    region => region.countryId === contractFields.countryId
  )
  const thisRegionZones = zones.filter(
    zone => zone.regionId === contractFields.regionId
  )

  const thisCountryIdentificationDocument = identificationDocuments.find(
    identificationDocument =>
      identificationDocument.countryId === contractFields.countryId
  )

  const handleUpdateContract = () => {
    dispatch(
      updateContract({
        ...contractFields,
        contractName: contractFields.name,
        contractQuantity: contractFields.quantity,
      })
    )

    showFeedback()
  }

  return (
    <>
      <Grid container spacing={matchMd ? 8 : 3}>
        <Grid lg={5} md={12} item>
          <Grid container alignItems='center'>
            <FormField label='País'>
              <FormField.Select
                {...bindField('countryId')}
                options={countries}
                optionValue='id'
                display='name'
              />
            </FormField>

            <FormField label={thisCountryIdentificationDocument?.type}>
              <FormField.TextField
                {...bindField('identificationDocumentValue')}
              />
            </FormField>

            <FormField label='Empresa'>
              <FormField.TextField {...bindField('name')} />
            </FormField>

            <FormField label='Dirección'>
              <FormField.TextField {...bindField('address')} />
            </FormField>

            <FormField label='Región'>
              <FormField.Select
                {...bindField('regionId')}
                options={thisCountryRegions}
                optionValue='id'
                display='name'
              />
            </FormField>

            <FormField label='Comuna'>
              <FormField.Select
                {...bindField('zoneId')}
                options={thisRegionZones}
                optionValue='id'
                display='name'
              />
            </FormField>
          </Grid>
        </Grid>

        <Grid item lg={7} md={12} mt={matchMd ? 2 : 0}>
          <Grid container spacing={matchMd ? 3 : 2}>
            <InformationItem label='Fecha inicio contrato'>
              <DayJS format='DD-MM-YYYY'>{contract.created_at}</DayJS>
            </InformationItem>

            <InformationItem label='Fecha última modificación'>
              <DayJS format='DD-MM-YYYY'>{contract.updated_at}</DayJS>
            </InformationItem>

            <InformationItem label='Moneda'>
              {thisContractCurrency?.code}
            </InformationItem>
          </Grid>
        </Grid>
      </Grid>

      {/* <Grid item xs={12}>
        <ContractDetail contract={contract} />
      </Grid> */}

      <Grid container justifyContent='flex-end'>
        <Stack alignItems='center' direction='row' spacing={1}>
          {feedback && (
            <>
              <CheckIcon color='success' />
              <Typography variant='body1' color='success'>
                Guardado
              </Typography>
            </>
          )}
          <Tooltip title='Guardar cambios'>
            <IconButton onClick={handleUpdateContract}>
              <SaveIcon fontSize='large' color='success' />
            </IconButton>
          </Tooltip>
        </Stack>
      </Grid>
    </>
  )
}

export default Contract
