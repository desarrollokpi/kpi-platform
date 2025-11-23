import React from 'react'
import List from '@mui/material/List'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import UsersGroupItem from './UsersGroupsItem'
import { useSelector } from 'react-redux'
import useResponsive from './../../hooks/useResponsive'
import Loading from '../layout/Loading'

const UsersGroups = () => {
  // const { users } = useSelector(state => state.users)

  const { usersGroups, loading } = useSelector(state => state.usersGroups)

  const headersMd = [
    { xs: 3, header: 'Código' },
    { xs: 4, header: 'Nombre' },
    { xs: 1, header: 'Usuarios' },
    { xs: 1, header: 'Secciones' },
    { xs: 2, header: 'Activo' },
    { xs: 1, header: 'Acciones' },
  ]

  const headersXs = [
    { xs: 9, header: 'Nombre' },
    { xs: 3, header: 'Acciones' },
  ]

  const matchMd = useResponsive('md')

  const headers = matchMd ? headersMd : headersXs

  if (loading && usersGroups.length === 0)
    return <Loading height={70} number={4} />

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
      {usersGroups.map(usersGroup => (
        <UsersGroupItem usersGroup={usersGroup} key={usersGroup.id} />
      ))}
    </List>
  )
}

export default UsersGroups
