import React, { useEffect, useCallback, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Paper, Box, Typography, IconButton, Tooltip, CircularProgress, Snackbar, Alert } from '@mui/material'
import { Download as DownloadIcon, Email as EmailIcon } from '@mui/icons-material'
import LoadingButton from '@mui/lab/LoadingButton'
import { embedDashboard } from '@superset-ui/embedded-sdk'
import { getDashboardEmbeddedConfig, exportDashboardCsv, sendDashboardEmail } from '../state/dashboards/dashboardsActions'

const ShowDashboardPage = () => {
  const dispatch = useDispatch()
  const { dashboardId } = useParams()
  const supersetContainer = useRef(null)
  const [embedLoading, setEmbedLoading] = useState(true)
  const [csvLoading, setCsvLoading] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [embeddedConfig, setEmbeddedConfig] = useState(null)

  const { loading } = useSelector(state => state.dashboards)

  useEffect(() => {
    if (dashboardId) {
      // Obtener configuración de embedding (guest token + config)
      dispatch(getDashboardEmbeddedConfig(dashboardId))
        .then((config) => {
          setEmbeddedConfig(config)
        })
        .catch((error) => {
          setSnackbar({
            open: true,
            message: 'Error al cargar configuración del dashboard',
            severity: 'error'
          })
          setEmbedLoading(false)
        })
    }
  }, [dispatch, dashboardId])

  const generateEmbedded = useCallback(
    async (embedData) => {
      if (!embedData || !supersetContainer.current) return

      setEmbedLoading(true)

      try {
        await embedDashboard({
          id: embedData.dashboardId || embedData.embeddedId,
          supersetDomain: embedData.supersetDomain || embedData.baseUrl,
          mountPoint: supersetContainer.current,
          fetchGuestToken: () => embedData.token,
          dashboardUiConfig: {
            hideTitle: false,
            hideTab: true,
            hideChartControls: false,
            filters: {
              visible: true,
            },
          },
        })

        const iframe = supersetContainer.current.querySelector('iframe')

        if (iframe) {
          iframe.style.width = '100%'
          iframe.style.height = '85vh'
          iframe.style.border = 'none'
        }

        setEmbedLoading(false)
      } catch (error) {
        console.error('Error embedding dashboard:', error)
        setEmbedLoading(false)
      }
    },
    [supersetContainer]
  )

  useEffect(() => {
    if (embeddedConfig) {
      generateEmbedded(embeddedConfig)
    }
  }, [embeddedConfig, generateEmbedded])

  const handleExportCsv = async () => {
    if (dashboardId) {
      setCsvLoading(true)
      try {
        await dispatch(exportDashboardCsv(dashboardId))
        setSnackbar({ open: true, message: 'CSV descargado exitosamente', severity: 'success' })
      } catch (error) {
        setSnackbar({ open: true, message: 'Error al descargar CSV', severity: 'error' })
      } finally {
        setCsvLoading(false)
      }
    }
  }

  const handleSendEmail = async () => {
    if (dashboardId) {
      if (window.confirm('¿Enviar este dashboard por email?')) {
        setEmailLoading(true)
        try {
          await dispatch(sendDashboardEmail(dashboardId))
          setSnackbar({ open: true, message: 'Email enviado exitosamente', severity: 'success' })
        } catch (error) {
          setSnackbar({ open: true, message: 'Error al enviar email', severity: 'error' })
        } finally {
          setEmailLoading(false)
        }
      }
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  if (loading || embedLoading) {
    return (
      <Paper className='container'>
        <Box display='flex' justifyContent='center' alignItems='center' minHeight='60vh'>
          <CircularProgress />
        </Box>
      </Paper>
    )
  }

  return (
    <Paper className='container'>
      <Box mb={2} display='flex' justifyContent='space-between' alignItems='center'>
        <Typography variant='h6'>
          {embeddedConfig?.dashboardName || 'Dashboard'}
        </Typography>
        <Box>
          <Tooltip title='Descargar datos en CSV'>
            <span>
              <LoadingButton
                onClick={handleExportCsv}
                loading={csvLoading}
                disabled={csvLoading}
                color='primary'
                size='small'
                startIcon={<DownloadIcon />}
              >
                CSV
              </LoadingButton>
            </span>
          </Tooltip>
          <Tooltip title='Enviar por email (PDF)'>
            <span>
              <LoadingButton
                onClick={handleSendEmail}
                loading={emailLoading}
                disabled={emailLoading}
                color='secondary'
                size='small'
                startIcon={<EmailIcon />}
                sx={{ ml: 1 }}
              >
                Email
              </LoadingButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <Box
        ref={supersetContainer}
        className='superset-container'
        sx={{
          width: '100%',
          minHeight: '85vh',
          position: 'relative',
        }}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  )
}

export default ShowDashboardPage
