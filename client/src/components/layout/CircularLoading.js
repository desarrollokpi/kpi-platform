import React from 'react'

import Stack from '@mui/material/Stack'
import CircularProgress from '@mui/material/CircularProgress'

const CircularLoading = () => {
  return (
    <Stack
      // direction='row'
      justifyContent='center'
      spacing={2}
      alignItems='center'
    >
      <CircularProgress size='2rem' />
    </Stack>
  )
}

export default CircularLoading
