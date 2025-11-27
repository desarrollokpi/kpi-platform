import React from 'react'
import AccountPanel from './AccountPanel'
import { Grid, Typography, Button, Box } from '@mui/material'
import { useSelector } from 'react-redux'
import ActiveIndicator from './../layout/ActiveIndicator'
import KeyIcon from '@mui/icons-material/Key'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

const DetailsPanel = () => {
  const { user } = useSelector(state => state.auth)
  const navigate = useNavigate()

  const details = [
    { id: 1, name: 'Nombre de cuenta', value: user.name },
    { id: 2, name: 'Subdominio', value: user.subdomain },
    { id: 3, name: 'Key User', value: user.keyUser },
    { id: 4, name: 'Activo', value: <ActiveIndicator active={user.active} /> },
  ]

  const handleChangePassword = () => {
    navigate('/admins/changePassword')
  }

  return (
    <AccountPanel title='Detalle de cuenta'>
      <Grid container spacing={3} mb={3} justifyContent='center'>
        {details.map(detail => (
          <React.Fragment key={detail.id}>
            <Grid item xs={6}>
              <Typography variant='body1' display='block ' align='right'>
                {detail.name}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant='body1'>{detail.value}</Typography>
            </Grid>
          </React.Fragment>
        ))}
      </Grid>
      <Box textAlign='center'>
        <Button
          onClick={handleChangePassword}
          startIcon={<KeyIcon />}
          variant='contained'
        >
          Cambiar contraseña
        </Button>
      </Box>
    </AccountPanel>
  )
}

export default DetailsPanel
