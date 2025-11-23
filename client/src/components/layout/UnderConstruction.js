import React from 'react'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import ConstructionIcon from '@mui/icons-material/Construction'

const UnderConstruction = ({ children }) => {
  return (
    <Paper className='construction'>
      <Grid>
        <ConstructionIcon />
        <Box mt={3}>EN DESARROLLO</Box>
        <Box mt={3}>{children}</Box>
      </Grid>
    </Paper>
  )
}

export default UnderConstruction
