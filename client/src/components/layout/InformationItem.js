import React from 'react'

import { Typography, Grid } from '@mui/material'

const InformationItem = ({ label, children }) => {
  return (
    <>
      <Grid item xs={8} lg={4}>
        <Typography variant='accent'>{label}</Typography>
      </Grid>
      <Grid item xs={4} lg={8}>
        <Typography variant='body1'>{children}</Typography>
      </Grid>
    </>
  )
}

export default InformationItem
