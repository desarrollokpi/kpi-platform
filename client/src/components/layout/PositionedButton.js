import React from 'react'

import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'

const PositionedButton = ({
  startIcon,
  onClick,
  justifyContent,
  children,
  ...props
}) => {
  return (
    <Grid container justifyContent={justifyContent} mt={3}>
      <Button
        onClick={onClick}
        startIcon={startIcon}
        variant='contained'
        {...props}
      >
        {children}
      </Button>
    </Grid>
  )
}

export default PositionedButton
