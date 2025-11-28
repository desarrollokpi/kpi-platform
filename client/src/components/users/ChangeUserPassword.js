import React from 'react'
import { readUsers } from '../../state/users/usersActions'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'

import Loading from '../layout/Loading'
import FormField from '../layout/FormField'
import { Paper, Typography, Grid, Button } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import useForm from './../../hooks/useForm'

import { useNavigate } from 'react-router-dom'
import useToggle from './../../hooks/useToggle'
import useNavigateAfterAction from './../../hooks/useNavigateAfterAction'
import { changeUserPassword } from './../../state/admins/adminsActions'

const ChangeUserPassword = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { users } = useSelector(state => state.users)
  const { loading } = useSelector(state => state.admins)

  const buttonHasBeenClicked = useNavigateAfterAction(loading, '/admins/users')

  const [error, toggleError] = useToggle(false)

  const [fields, bindField, areFieldsEmpty] = useForm({
    password: '',
    confirmPassword: '',
  })

  React.useEffect(() => {
    if (users.length === 0) dispatch(readUsers())
  }, [dispatch, users.length])

  React.useEffect(() => {
    if (error && fields.password === fields.confirmPassword) toggleError()
  }, [error, fields.password, fields.confirmPassword, toggleError])

  let thisUser = undefined

  const { userId } = useParams()

  if (loading)
    return (
      <Paper className='container'>
        <Loading number={2} height={80} />
      </Paper>
    )

  if (userId) {
    thisUser = users.find(user => user.id === parseInt(userId))
  }

  const handleChangeUserPassword = () => {
    if (fields.password !== fields.confirmPassword) {
      toggleError()
    } else {
      console.log(fields)
      dispatch(changeUserPassword(thisUser.id, fields.password))
      buttonHasBeenClicked()
    }
  }

  return (
    <Paper className='container'>
      <Grid container justifyContent='center' spacing={3}>
        <Grid item xs={12}>
          <Typography variant='h6' align='center'>
            Cambio de contraseña para {thisUser?.name}
          </Typography>
        </Grid>

        <Grid
          item
          container
          justifyContent='center'
          s
          md={8}
          alignItems='center'
        >
          <FormField label='Contraseña'>
            <FormField.TextField
              error={error}
              type='password'
              helperText={error && 'Ambos campos debes ser iguales'}
              {...bindField('password')}
            />
          </FormField>

          <FormField label='Confirmar contraseña'>
            <FormField.TextField
              error={error}
              type='password'
              helperText={error && 'Ambos campos debes ser iguales'}
              {...bindField('confirmPassword')}
            />
          </FormField>
        </Grid>
      </Grid>

      <Grid mt={3} container justifyContent='space-between'>
        <Button onClick={() => navigate('/admins/users')}>Cancelar</Button>
        <LoadingButton
          onClick={handleChangeUserPassword}
          variant='contained'
          loading={loading}
          disabled={areFieldsEmpty}
        >
          {userId ? 'Guardar cambios' : 'Crear usuario'}
        </LoadingButton>
      </Grid>
    </Paper>
  )
}

export default ChangeUserPassword
