import React from 'react'
import {
  Grid,
  IconButton,
  Collapse,
  ListItem,
  ListItemText,
  Typography,
  ListItemSecondaryAction,
} from '@mui/material'

import KeyIcon from '@mui/icons-material/Key'
import EditIcon from '@mui/icons-material/Edit'
import UserReportsTable from './UserReportsTable'
import ActiveIndicator from '../layout/ActiveIndicator'
import VisibilityIcon from '@mui/icons-material/Visibility'
import useResponsive from './../../hooks/useResponsive'
import { useNavigate } from 'react-router-dom'

const UsersItem = ({ user }) => {
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()

  const matchMd = useResponsive('md')

  const handleToggleCollapse = () => {
    setOpen(!open)
  }

  const handleEdit = () => {
    navigate(`/admins/users/update/${user?.id}`)
  }

  const handleChangePassword = () => {
    navigate(`/admins/users/change-password/${user?.id}`)
  }

  return (
    <>
      <ListItem dense>
        <Grid container alignItems='center' justifyContent='center'>
          {matchMd && (
            <Grid item md={3}>
              <ListItemText>
                <Typography variant='body1'>{user?.name} </Typography>
              </ListItemText>
            </Grid>
          )}
          <Grid item md={3} xs={9}>
            <ListItemText>
              <Typography variant='body1'>{user?.username}</Typography>
            </ListItemText>
          </Grid>
          {matchMd && (
            <>
              <Grid item md={3}>
                <ListItemText>
                  <Typography variant='body1'>{user?.mail}</Typography>
                </ListItemText>
              </Grid>
              <Grid item md={1}>
                <ListItemText>
                  <Typography variant='body1'>
                    {user?.reportGroups.length}
                  </Typography>
                </ListItemText>
              </Grid>
              <Grid item md={1}>
                <ListItemText>
                  <ActiveIndicator active={user?.active} />
                </ListItemText>
              </Grid>
            </>
          )}

          <Grid item md={1} xs={3}>
            <ListItemSecondaryAction>
              <IconButton
                onClick={handleToggleCollapse}
                disabled={user?.reportGroups?.length === 0}
              >
                <VisibilityIcon
                  color={
                    user?.reportGroups?.length === 0 ? 'disabled' : 'primary'
                  }
                />
              </IconButton>

              <IconButton onClick={handleEdit}>
                <EditIcon color='success' />
              </IconButton>

              <IconButton onClick={handleChangePassword}>
                <KeyIcon color='error' />
              </IconButton>
            </ListItemSecondaryAction>
          </Grid>
        </Grid>
      </ListItem>

      <Collapse in={open} timeout='auto' unmountOnExit>
        <UserReportsTable user={user} />
      </Collapse>
    </>
  )
}
export default UsersItem
