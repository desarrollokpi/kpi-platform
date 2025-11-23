import React from 'react'
import { Grid } from '@mui/material'
import DetailsPanel from './DetailsPanel'
import LogoPanel from './LogoPanel'
import UtilsPanel from './UtilsPanel'
import useResponsive from './../../hooks/useResponsive'

const AdminAccount = () => {
  const matchMd = useResponsive('md')
  return (
    <>
      <Grid container>
        <Grid xs={12} md={4} mb={matchMd ? 0 : 3} item>
          <DetailsPanel />
        </Grid>

        <Grid xs={12} md={4} item>
          <LogoPanel />
        </Grid>
      </Grid>
      <Grid container mt={2} spacing={2}>
        <Grid xs item>
          <UtilsPanel />
        </Grid>
      </Grid>
    </>
  )
}

export default AdminAccount
