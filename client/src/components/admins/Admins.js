import React from 'react'
import List from '@mui/material/List'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import AdminsItem from './AdminsItem'
import { useSelector } from 'react-redux'
import useResponsive from './../../hooks/useResponsive'

const Admins = () => {
  const { admins } = useSelector(state => state.admins)

  const headersMd = [
    { xs: 3, header: 'Nombre' },
    { xs: 3, header: 'Subdominio' },
    { xs: 2, header: 'Key-user' },
    { xs: 2, header: 'Workspaces' },
    { xs: 1, header: 'Activo' },
    { xs: 1, header: 'Acciones' },
  ]

  const headersXs = [
    { xs: 9, header: 'Nombre' },
    { xs: 3, header: 'Acciones' },
  ]

  const matchMd = useResponsive('md')

  const headers = matchMd ? headersMd : headersXs

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
      {admins.map(admin => (
        <AdminsItem admin={admin} key={admin.id} />
      ))}
    </List>
  )
}

export default Admins
