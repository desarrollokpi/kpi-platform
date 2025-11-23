import React from 'react'
import List from '@mui/material/List'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

import ReportGroupsItem from './ReportGroupsItem'
import useResponsive from './../../hooks/useResponsive'
import { useSelector } from 'react-redux'

import Loading from '../layout/Loading'

import CircularLoading from '@layout/CircularLoading'


const ReportsGroups = ({ reportsGroups }) => {
  const { loading } = useSelector(state => state.reports)

  const headersMd = [
    { xs: 4, header: 'Código' },
    { xs: 4, header: 'Nombre' },
    { xs: 2, header: 'Secciones' },
    { xs: 1, header: 'Activo' },
    { xs: 1, header: 'Acciones' },
  ]

  const headersXs = [
    { xs: 9, header: 'Nombre' },
    { xs: 3, header: 'Acciones' },
  ]

  const matchMd = useResponsive('md')

  const headers = matchMd ? headersMd : headersXs

  if (loading) return <CircularLoading />

  if (!loading && reportsGroups.length === 0)
    return (
      <Typography variant='h6' align='center'>
        No hay grupos de reporte. Presiona el botón "Agrega nuevo grupo" para comenzar
      </Typography>
    )

  return (
    <>
      {loading && reportsGroups.length === 0 ? (
        <Loading number={4} height={80} />
      ) : (
        <List>
          <Grid container alignItems='center' justifyContent='center' mb={3}>
            {headers.map(header => (
              <Grid key={header.header} item xs={header.xs}>
                <Typography sx={{ fontWeight: 'bold' }} variant='body1'>
                  {header.header}
                </Typography>
              </Grid>
            ))}
          </Grid>
          {reportsGroups.map(reportsGroup => (
            <ReportGroupsItem
              key={reportsGroup.id}
              reportsGroup={reportsGroup}
            />
          ))}
        </List>
      )}
    </>
  )
}

export default ReportsGroups
