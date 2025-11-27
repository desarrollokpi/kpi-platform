import React from 'react'
import List from '@mui/material/List'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

import AssignDashboardsListItem from './AssignDashboardsListItem'
import useResponsive from '../../hooks/useResponsive'

const AssignDashboardsList = ({
  dashboards,
  toggleSelectedDashboard,
  selectedDashboards,
}) => {
  const headersMd = [
    { xs: 1, header: 'Seleccionar' },
    { xs: 3, header: 'Nombre' },
    { xs: 2, header: 'Superset ID' },
    { xs: 4, header: 'Descripción' },
    { xs: 1, header: 'Activo' },
  ]

  const headersXs = [
    { xs: 2, header: '' },
    { xs: 7, header: 'Nombre' },
    { xs: 3, header: 'Estado' },
  ]

  const matchMd = useResponsive('md')

  const headers = matchMd ? headersMd : headersXs

  return (
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

      {dashboards.map(dashboard => (
        <AssignDashboardsListItem
          selectedDashboards={selectedDashboards}
          toggleSelectedDashboard={toggleSelectedDashboard}
          key={dashboard.id}
          dashboard={dashboard}
        />
      ))}
    </List>
  )
}

export default AssignDashboardsList
