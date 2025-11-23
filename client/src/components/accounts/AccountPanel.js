import React from 'react'
import { Paper, CardContent } from '@mui/material'
import Typography from '@mui/material/Typography'

const AccountPanel = ({ title, children }) => {
  return (
    <Paper className='container'>
      <Typography variant='h6' align='center' mb={3}>
        {title}
      </Typography>
      {children}
    </Paper>
  )
}

export default AccountPanel
