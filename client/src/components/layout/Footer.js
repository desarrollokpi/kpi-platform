import React from 'react'

import { styled } from '@mui/material'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

import kpiManagersLogo from '../../img/kpi-logo.png'
import microsoftAzureLogo from '../../img/azure-logo.png'
import positiveSSLLogo from '../../img/positive-ssl-logo.png'
import useResponsive from './../../hooks/useResponsive'

const Footer = () => {
  const matchMd = useResponsive('md')

  const FooterContainer = styled(Paper)(({ theme }) => ({
    position: 'fixed',
    bottom: 0,
    width: '100%',
    // height: '64px',
    borderRadius: 0,
    boxShadow: theme.shadows[3],
    // padding: theme.spacing(2),
  }))

  return (
    <footer>
      <FooterContainer>
        <Box p={1}>
          <Grid
            container
            spacing={matchMd ? 10 : 2}
            justifyContent={matchMd ? 'flex-end' : 'center'}
          >
            <Grid item md={2} xs={6}>
              <Stack spacing={1} alignItems='center'>
                <Typography align='center' variant='caption' color='primary'>
                  Powered by:
                </Typography>
                <img src={kpiManagersLogo} width='140' alt='KPI Managers' />
              </Stack>
            </Grid>
            <Grid item md={2} xs={6}>
              <Stack spacing={1} alignItems='center'>
                <Typography align='center' variant='caption' color='primary'>
                  Over:
                </Typography>
                <img
                  src={microsoftAzureLogo}
                  width='120'
                  alt='Microsoft Azure'
                />
              </Stack>
            </Grid>
            <Grid item md={2} xs={6}>
              <Stack spacing={1} alignItems='center'>
                <Typography align='center' variant='caption' color='primary'>
                  Protected by:
                </Typography>
                <img src={positiveSSLLogo} width='120' alt='Positive SSL' />
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </FooterContainer>
    </footer>
  )
}

export default Footer
