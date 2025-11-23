import React from 'react'
import UserReportsTableRow from './UserReportsTableRow'

import List from '@mui/material/List'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

import ManageUserReportsGroupsItem from './ManageUserReportsGroupsItem'
import useResponsive from '../../hooks/useResponsive'

const ManageUserReportGroups = ({
  reportsGroups,
  toggleSelectedReportsGroup,
  selectedReportsGroups,
}) => {
  const headersMd = [
    { xs: 1, header: 'Seleccionar' },
    { xs: 4, header: 'Código' },
    { xs: 4, header: 'Nombre' },
    { xs: 1, header: 'Secciones' },
    { xs: 1, header: 'Activo' },
    { xs: 1, header: 'Detalle' },
  ]

  const headersXs = [
    { xs: 3, header: '' },
    { xs: 6, header: 'Nombre' },
    { xs: 3, header: 'Detalle' },
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

      {reportsGroups.map(reportsGroup => (
        <ManageUserReportsGroupsItem
          selectedReportsGroups={selectedReportsGroups}
          toggleSelectedReportsGroup={toggleSelectedReportsGroup}
          key={reportsGroup.id}
          reportsGroup={reportsGroup}
        />
      ))}
    </List>
  )
}

export default ManageUserReportGroups
