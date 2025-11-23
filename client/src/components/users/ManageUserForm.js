import React from 'react'
import { Typography, Switch, Grid } from '@mui/material'
import FormField from '../layout/FormField'

const ManagerUserForm = ({ userId, bindField, active, handleSwitchChange }) => {
  return (
    <Grid container justifyContent='center' spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h6' align='center' mb={3}>
          Datos básicos del usuario:
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
        <FormField label='Nombre'>
          <FormField.TextField {...bindField('name')} />
        </FormField>

        <FormField label='Nombre de usuario'>
          <FormField.TextField {...bindField('username')} />
        </FormField>

        <FormField label='Email'>
          <FormField.TextField {...bindField('mail')} />
        </FormField>

        <FormField label='Confirmar Email'>
          <FormField.TextField {...bindField('confirmMail')} />
        </FormField>

        {!userId && (
          <>
            <FormField label='Contraseña'>
              <FormField.TextField
                type='password'
                autoComplete='on'
                {...bindField('password')}
              />
            </FormField>
            <FormField label='Confirmar contraseña'>
              <FormField.TextField
                type='password'
                autoComplete='on'
                {...bindField('confirmPassword')}
              />
            </FormField>
          </>
        )}

        <FormField label='Activo' mt={2}>
          <Switch checked={active} onChange={handleSwitchChange} />
        </FormField>
      </Grid>

      <Grid item xs={12}>
        <Typography variant='h6' align='center' mb={3}>
          Grupos de reportes habilitados para este usuario:
        </Typography>
      </Grid>
    </Grid>
  )
}

export default ManagerUserForm
