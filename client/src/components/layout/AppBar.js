import React, { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import AppBar from '@mui/material/AppBar'
import Typography from '@mui/material/Typography'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import { useTheme } from '@mui/material/styles'
import SettingsIcon from '@mui/icons-material/Settings'

import ListItemIcon from '@mui/material/ListItemIcon'
import KeyIcon from '@mui/icons-material/Key'
import LogoutIcon from '@mui/icons-material/Logout'

import { useSelector, useDispatch } from 'react-redux'
import { signOut } from '../../state/auth/authActions'

import Button from '@mui/material/Button'
import Image from './Image'

import useMediaQuery from '@mui/material/useMediaQuery'
import roles from './../../constants/roles'
import { MuiTab } from '@mui/material/Tab'

import useMenu from '@hooks/useMenu'

const ApplicationBar = () => {
  const { user, isAuthenticated, loading } = useSelector(state => state.auth)
  const { loading: loadingReports } = useSelector(state => state.reports)
  const { appBarLogo } = useSelector(state => state.admins)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const theme = useTheme()
  const matches = useMediaQuery(theme.breakpoints.up('lg'))
  const [anchorEl, handleOpenMenu, handleCloseMenu] = useMenu()

  const handleSignOut = () => {
    dispatch(signOut(user?.role))
  }

  const handleChangePassword = () => {
    navigate('/users/change-password')
    handleCloseMenu()
  }

  return (
    <AppBar position='sticky' color='light'>
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Image
            src={appBarLogo}
            alt='logo'
            width={`${matches ? false : '120px'}`}
            style={{ maxHeight: '70px' }}
          />
        </Box>

        {user && isAuthenticated && (
          <>
            <Typography mr={1} variant='body1' color='secondary'>
              Usuario:
            </Typography>
            <Typography sx={{ mr: 2 }}>{user.name}</Typography>
            {user?.role === roles.USER && (
              <>
                <IconButton onClick={handleOpenMenu} color='inherit'>
                  <SettingsIcon />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                >
                  <MenuItem onClick={handleChangePassword}>
                    <ListItemIcon>
                      <KeyIcon fontSize='small' />
                    </ListItemIcon>
                    Cambiar contraseña
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleSignOut}>
                    <ListItemIcon>
                      <LogoutIcon fontSize='small' />
                    </ListItemIcon>
                    Salir
                  </MenuItem>
                </Menu>
              </>
            )}
            <Button
              endIcon={<LogoutIcon fontSize='small' />}
              onClick={handleSignOut}
              disabled={loading || loadingReports}
              color='primary'
            >
              Salir
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default ApplicationBar
