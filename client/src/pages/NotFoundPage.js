import React from 'react'
import { useNavigate } from 'react-router-dom'

import AppBar from '../components/layout/AppBar'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import SearchOffIcon from '@mui/icons-material/SearchOff'

const NotFoundPage = () => {
  const navigate = useNavigate()
  return (
    <>
      <AppBar />
      <Grid container justifyContent='center'>
        <Grid item xs={12} md={8}>
          <Box sx={{ textAlign: 'center' }} mt={10}>
            <SearchOffIcon color='primary' style={{ fontSize: 80 }} />
            <Typography sx={{ fontWeight: 'bold' }} mt={3} variant='h4'>
              404
            </Typography>
            <Typography mt={1} mb={4} variant='h5'>
              Página no encontrada
            </Typography>

            <Button
              variant='outlined'
              onClick={() => navigate('/admins/reports-groups')}
            >
              Ir atrás
            </Button>
          </Box>
        </Grid>
      </Grid>
    </>
  )
}

export default NotFoundPage
