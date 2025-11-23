import React from 'react'
import List from '@mui/material/List'
import Grid from '@mui/material/Grid'
import UsersItem from './UsersItem'
import { useSelector } from 'react-redux'
import useResponsive from './../../hooks/useResponsive'
import Typography from '@mui/material/Typography'
import CircularLoading from '@layout/CircularLoading'

const Users = () => {
  const { users, loading } = useSelector(state => state.users)

  const headersMd = [
    { xs: 3, header: 'Nombre' },
    { xs: 3, header: 'Usuario' },
    { xs: 3, header: 'E-Mail' },
    { xs: 1, header: 'Grupos' },
    { xs: 1, header: 'Activo' },
    { xs: 1, header: 'Acciones' },
  ]

  const headersXs = [
    { xs: 9, header: 'Usuario' },
    { xs: 3, header: 'Acciones' },
  ]

  const matchMd = useResponsive('md')

  const headers = matchMd ? headersMd : headersXs

  if (loading) return <CircularLoading />

  if (!loading && users.length === 0)
    return (
      <Typography variant='h6' align='center'>
        No hay usuarios. Presiona el botón "Agrega nuevo usuario" para comenzar
      </Typography>
    )

  return (
    <List>
      <Grid container alignItems='center' justifyContent='center' mb={3}>
        {headers.map(header => (
          <Grid key={header.header} item xs={header.xs}>
            <Typography sx={{ fontWeight: 'bold' }} variant='body1'>
              {header.header}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {users.map(user => (
        <UsersItem user={user} key={user.id} />
      ))}
    </List>
  )
}

export default Users
