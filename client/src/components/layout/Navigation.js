import {
  List,
  Paper,
  Collapse,
  Typography,
  IconButton,
  Grid,
  Box,
} from '@mui/material'
import React from 'react'
import NavItem from './NavItem'
import useResponsive from './../../hooks/useResponsive'
import MenuIcon from '@mui/icons-material/Menu'

import { useSelector } from 'react-redux'
import roles from '../../constants/roles'

import useToggle from '../../hooks/useToggle'

const Navigation = () => {
  const matchLg = useResponsive('lg')
  const { user } = useSelector(state => state.auth)
  const isAdmin = user?.role === roles.ADMIN

  const adminLinks = [
    { name: 'Grupos de reporte', to: '/admins/reports-groups' },
    { name: 'Reportes', to: '/admins/show-report' },
    { name: 'Usuarios', to: '/admins/users' },
    { name: 'Cuenta', to: '/admins/account' },
  ]

  const superuserLinks = [
    { name: 'Administradores', to: '/superusers/admins' },
    { name: 'Cuenta', to: '/admins/account', disabled: true },
  ]

  const [open, toggleOpen] = useToggle()

  const NavigationItems = ({ links }) => (
    <List>
      {links.map(link => (
        <NavItem
          key={link.to}
          to={link.to}
          onClick={toggleOpen}
          disabled={link.disabled}
        >
          <Typography variant='body1'>{link.name}</Typography>
        </NavItem>
      ))}
    </List>
  )

  const links = isAdmin ? adminLinks : superuserLinks

  return (
    <>
      {matchLg ? (
        <Paper className='navigation'>
          <NavigationItems links={links} />
        </Paper>
      ) : (
        <>
          <Paper className='navigation-mobile'>
            <Grid container alignItems='center' justifyContent='space-between'>
              <Grid item xs={10}>
                <Typography align='center' variant='body2'>
                  Navegación
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <IconButton onClick={toggleOpen}>
                  <MenuIcon />
                </IconButton>
              </Grid>
            </Grid>
            <Collapse in={open} timeout='auto' unmountOnExit>
              <Box
                sx={{
                  padding: '20px',
                }}
              >
                <NavigationItems links={links} />
              </Box>
            </Collapse>
          </Paper>
        </>
      )}
    </>
  )
}

export default Navigation
