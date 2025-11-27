import React, { useEffect } from 'react'
import { Grid, Paper, Button, Typography, Box } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import LoadingButton from '@mui/lab/LoadingButton'

import { readUsers } from '../../state/users/usersActions'
import { getAllDashboards } from '../../state/dashboards/dashboardsActions'
import {
  getUserDashboards,
  bulkAssignDashboards,
} from '../../state/usersDashboards/usersDashboardsActions'

import useSelectionList from '../../hooks/useSelectionList'
import useNavigateAfterAction from '../../hooks/useNavigateAfterAction'

import CircularLoading from '@layout/CircularLoading'
import AssignDashboardsList from './AssignDashboardsList'

const AssignDashboardsToUser = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { userId } = useParams()

  const { users, loading: usersLoading } = useSelector(state => state.users)
  const { dashboards, loading: dashboardsLoading } = useSelector(
    state => state.dashboards
  )
  const { userDashboards, loading } = useSelector(
    state => state.usersDashboards
  )

  const thisUser = users.find(user => user.id === parseInt(userId))

  useEffect(() => {
    dispatch(readUsers())
    dispatch(getAllDashboards({ active: true }))
    if (userId) {
      dispatch(getUserDashboards(userId))
    }
  }, [dispatch, userId])

  const initialSelectedDashboards = userDashboards.map(d => d.id)

  const [selectedDashboards, toggleSelectedDashboard, setSelectedDashboards] =
    useSelectionList(initialSelectedDashboards)

  useEffect(() => {
    if (userDashboards.length > 0) {
      setSelectedDashboards(userDashboards.map(d => d.id))
    }
  }, [userDashboards, setSelectedDashboards])

  const buttonHasBeenClicked = useNavigateAfterAction(loading, '/admins/users')

  const handleAssignDashboards = () => {
    dispatch(bulkAssignDashboards(userId, selectedDashboards))
    buttonHasBeenClicked()
  }

  if (usersLoading || dashboardsLoading || !thisUser)
    return (
      <Paper className='container'>
        <CircularLoading />
      </Paper>
    )

  if (!dashboardsLoading && dashboards.length === 0)
    return (
      <Paper className='container'>
        <Typography variant='h6' align='center'>
          No hay dashboards disponibles para asignar
        </Typography>
      </Paper>
    )

  return (
    <Paper className='container'>
      <Box mb={3}>
        <Typography variant='h5' component='h1' gutterBottom>
          Asignar Dashboards a Usuario
        </Typography>
        <Typography variant='body1' color='textSecondary'>
          Usuario: <strong>{thisUser.name}</strong> ({thisUser.mail})
        </Typography>
        <Typography variant='body2' color='textSecondary' mt={1}>
          Seleccione los dashboards que desea asignar a este usuario
        </Typography>
      </Box>

      <AssignDashboardsList
        dashboards={dashboards}
        selectedDashboards={selectedDashboards}
        toggleSelectedDashboard={toggleSelectedDashboard}
      />

      <Grid mt={3} container justifyContent='space-between'>
        <Button onClick={() => navigate('/admins/users')}>Cancelar</Button>
        <LoadingButton
          onClick={handleAssignDashboards}
          variant='contained'
          loading={loading}
        >
          Guardar asignación
        </LoadingButton>
      </Grid>
    </Paper>
  )
}

export default AssignDashboardsToUser
