import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { Grid, Paper, Tabs } from '@mui/material'

import Tab from '@mui/material/Tab'

import AppBar from '@layout/AppBar'
import Alerts from '@layout/Alerts'

import { signIn, setLoading } from './../state/auth/authActions'
import FormField from '@layout/FormField'
import LoadingButton from '@mui/lab/LoadingButton'
import Footer from '@components/layout/Footer'
import { isDev } from '@util'

import useForm from '@hooks/useForm'
import useSubdomain from '../hooks/useSubdomain'
import useUserRoles from '../hooks/useUserRoles'

const initialCredentials = {
  name: '',
  password: '',
}

const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const subdomain = useSubdomain()
  const { user, isAuthenticated, loading } = useSelector(state => state.auth)

  const { userRoles, userRole, userRoleName, setUserRoleName } = useUserRoles()

  const [credentials, bindField, areFieldsEmpty, setCredentials] = useForm(
    isDev() ? userRole.devCredentials : initialCredentials
  )

  useEffect(() => {
    dispatch(setLoading(false))
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated && user && !loading) {
      navigate(userRole.redirectTo)
    }
  }, [isAuthenticated, navigate, loading, user, userRole])

  useEffect(() => {
    if (isDev()) setCredentials(userRole.devCredentials)
  }, [userRole, setCredentials])

  const handleLogin = e => {
    dispatch(signIn(userRole.role, { ...credentials, subdomain }))
  }

  const handleTabChange = role => e => {
    setUserRoleName(role)
  }

  return (
    <>
      <AppBar />
      <Alerts />
      <Grid justifyContent='center' alignItems='center' container mt={4}>
        <Grid item xs={12} md={5} lg={4} p={2}>
          <Tabs
            value={userRoleName}
            TabIndicatorProps={{ style: { backgroundColor: '#fff' } }}
          >
            {userRoles.map(role => (
              <Tab
                key={role.role}
                className='login'
                onClick={handleTabChange(role.role)}
                value={role.role}
                label={role.label}
              />
            ))}
          </Tabs>

          <Paper className='login'>
            <Grid container alignItems='center' component='form'>
              <FormField label='Usuario '>
                <FormField.TextField {...bindField('name')} />
              </FormField>

              <FormField label='Contraseña'>
                <FormField.TextField
                  type='password'
                  autoComplete='on'
                  {...bindField('password')}
                />
              </FormField>
            </Grid>

            <Grid mt={4} justifyContent='center' container>
              <LoadingButton
                variant='contained'
                disabled={areFieldsEmpty}
                onClick={handleLogin}
                loading={loading}
              >
                Ingresar
              </LoadingButton>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Footer />
    </>
  )
}

export default LoginPage
