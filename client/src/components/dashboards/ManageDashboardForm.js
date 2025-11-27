import React from 'react'
import { Typography, Switch, Grid, Alert } from '@mui/material'
import FormField from '../layout/FormField'
import CircularLoading from '../layout/CircularLoading'

const ManageDashboardForm = ({
  dashboardId,
  bindField,
  active,
  handleSwitchChange,
  reports = [],
  loadingReports = false,
  isSuperuser,
  isAdmin
}) => {

  if (loadingReports) {
    return <CircularLoading />
  }

  return (
    <Grid container justifyContent='center' spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h6' align='center' mb={3}>
          {dashboardId ? 'Editar Dashboard' : 'Crear Nuevo Dashboard'}
        </Typography>
      </Grid>

      <Grid
        item
        container
        justifyContent='center'
        xs={12}
        md={8}
        alignItems='center'
      >
        <FormField label='Nombre del Dashboard' required>
          <FormField.TextField
            {...bindField('name')}
            placeholder='Ej: Dashboard de Ventas'
            helperText='Nombre identificador del dashboard'
          />
        </FormField>

        <FormField label='Reporte Asociado' required>
          <FormField.Select
            {...bindField('reportsId')}
            options={reports}
            optionValue='id'
            display='name'
            helperText='Reporte al que pertenece este dashboard'
          />
        </FormField>

        <FormField label='Superset Dashboard ID' required>
          <FormField.TextField
            {...bindField('supersetId')}
            placeholder='Ej: 1234567890'
            helperText='ID numérico del dashboard en Superset'
          />
        </FormField>

        <FormField label='Superset Embedded ID' required>
          <FormField.TextField
            {...bindField('embeddedId')}
            placeholder='Ej: abc123-def456-ghi789'
            helperText='UUID del dashboard embebido en Superset'
          />
        </FormField>

        <FormField label='Descripción'>
          <FormField.TextField
            {...bindField('description')}
            multiline
            rows={3}
            placeholder='Descripción del dashboard'
            helperText='Descripción opcional del dashboard (opcional)'
          />
        </FormField>

        <FormField label='Dashboard Activo' mt={2}>
          <Switch checked={active} onChange={handleSwitchChange} />
        </FormField>
      </Grid>

      <Grid item xs={12}>
        {isAdmin && reports.length === 0 && (
          <Alert severity='warning' sx={{ mb: 2 }}>
            No hay reportes disponibles para tu cuenta. Contacta al superusuario para que configure reportes para tu tenant.
          </Alert>
        )}
        {isAdmin && reports.length > 0 && (
          <Alert severity='info' sx={{ mb: 2 }}>
            Solo puedes seleccionar reportes asignados a tu cuenta (tenant).
          </Alert>
        )}
        <Typography variant='body2' align='center' color='textSecondary' mt={2}>
          Los dashboards se asignan a usuarios desde la sección de gestión de permisos.
        </Typography>
      </Grid>
    </Grid>
  )
}

export default ManageDashboardForm
