import React from 'react'
import {
  Grid,
  IconButton,
  Collapse,
  ListItem,
  ListItemText,
  Typography,
  ListItemSecondaryAction,
  Stack,
} from '@mui/material'

import KeyIcon from '@mui/icons-material/Key'
import EditIcon from '@mui/icons-material/Edit'
// import UserReportsTable from './UserReportsTable'
import ActiveIndicator from '../layout/ActiveIndicator'
import VisibilityIcon from '@mui/icons-material/Visibility'
import useResponsive from './../../hooks/useResponsive'
import { useNavigate } from 'react-router-dom'
import AdminsWorkspacesTable from './AdminsWorkspacesTable'

const AdminsItem = ({ admin }) => {
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()

  const matchMd = useResponsive('md')

  const handleToggleCollapse = () => {
    setOpen(!open)
  }

  const handleEdit = () => {
    navigate(`/admins/users/update/${admin.id}`)
  }

  const handleChangePassword = () => {
    navigate(`/admins/users/change-password/${admin.id}`)
  }

  return (
    <>
      <ListItem dense>
        <Grid container alignItems='center' justifyContent='center'>
          <Grid item md={3} xs={9}>
            <ListItemText>
              <Typography variant='body1'>{admin.name}</Typography>
            </ListItemText>
          </Grid>

          {matchMd && (
            <>
              <Grid item md={3}>
                <ListItemText>
                  <Typography variant='body1'>{admin.subdomain} </Typography>
                </ListItemText>
              </Grid>
              <Grid item md={3}>
                <ListItemText>
                  <Typography variant='body1'>{admin.keyUser}</Typography>
                </ListItemText>
              </Grid>
              <Grid item md={1}>
                <ListItemText>
                  <Typography variant='body1'>
                    {admin.workspaces.length}
                  </Typography>
                </ListItemText>
              </Grid>
              <Grid item md={1}>
                <ListItemText>
                  <ActiveIndicator active={admin.active} />
                </ListItemText>
              </Grid>
            </>
          )}

          <Grid item md={1} xs={3}>
            <ListItemSecondaryAction>
              <IconButton
                onClick={handleToggleCollapse}
                disabled={admin.workspaces.length === 0}
              >
                <VisibilityIcon
                  color={admin.workspaces.length === 0 ? 'disabled' : 'primary'}
                />
              </IconButton>

              <IconButton onClick={handleEdit} disabled>
                <EditIcon color='disabled' />
              </IconButton>
            </ListItemSecondaryAction>
          </Grid>
        </Grid>
      </ListItem>

      <Collapse in={open} timeout='auto' unmountOnExit>
        <Stack alignItems='center'>
          <AdminsWorkspacesTable admin={admin} />
        </Stack>
      </Collapse>
    </>
  )
}
export default AdminsItem
