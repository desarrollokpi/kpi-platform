import React from 'react'
import { Grid, Paper, Button, Typography } from '@mui/material'
import {
  readReportGroupsByAdmin,
  readReportsByAdmin,
} from '../../state/reports/reportsActions'

import useForm from '../../hooks/useForm'
import { useDispatch } from 'react-redux'
import { createUser, updateUser } from '../../state/users/usersActions'
import { useParams } from 'react-router-dom'

import { useNavigate } from 'react-router-dom'
import useToggle from '../../hooks/useToggle'
import useRead from '../../hooks/useRead'

import { useSelector } from 'react-redux'
import useSelectionList from '../../hooks/useSelectionList'
import useNavigateAfterAction from './../../hooks/useNavigateAfterAction'
import LoadingButton from '@mui/lab/LoadingButton'

import ManageUserReportGroups from './ManageUserReportGroups'
import ManageUserForm from './ManageUserForm'
import CircularLoading from '@layout/CircularLoading'
import CreateReportGroupButton from '../reports/CreateReportGroupButton'

const ManageUser = () => {
  useRead(readReportGroupsByAdmin, readReportsByAdmin)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { reportsGroups, loading: reportsGroupLoading } = useSelector(
    state => state.reports
  )
  const { users, loading } = useSelector(state => state.users)

  const initialState = {
    username: '',
    mail: '',
    name: '',
    confirmMail: '',
    password: '',
    confirmPassword: '',
  }

  let thisUser = undefined

  const { userId } = useParams()

  if (userId) {
    thisUser = users.find(user => user.id === parseInt(userId))
    thisUser = { ...thisUser, confirmMail: thisUser.mail }
  }

  const buttonHasBeenClicked = useNavigateAfterAction(loading, '/admins/users')

  const [user, bindField, areFieldsEmpty] = useForm(
    userId ? thisUser : initialState
  )

  const [selectedReportsGroups, toggleSelectedReportsGroup] = useSelectionList(
    userId ? thisUser.reportGroups : []
  )

  const [active, handleSwitchChange] = useToggle(true)

  const handleManageUser = () => {
    const userData = { ...user, active, reportGroups: selectedReportsGroups }

    dispatch(userId ? updateUser(userData) : createUser(userData))

    buttonHasBeenClicked()
  }

  if (reportsGroupLoading || loading)
    return (
      <Paper className='container'>
        <CircularLoading />
      </Paper>
    )

  if (!reportsGroupLoading && reportsGroups.length === 0)
    return (
      <Paper className='container'>
        <Typography variant='h6' align='center'>
          Antes de crear un usuario, debe haber al menos un grupo de reportes
        </Typography>

        <CreateReportGroupButton justifyContent='center' />
      </Paper>
    )

  return (
    <Paper className='container'>
      <ManageUserForm
        userId={userId}
        bindField={bindField}
        active={active}
        handleSwitchChange={handleSwitchChange}
      />

      <ManageUserReportGroups
        selectedReportsGroups={selectedReportsGroups}
        reportsGroups={reportsGroups}
        toggleSelectedReportsGroup={toggleSelectedReportsGroup}
      />

      <Grid mt={3} container justifyContent='space-between'>
        <Button onClick={() => navigate('/admins/users')}>Cancelar</Button>
        <LoadingButton
          onClick={handleManageUser}
          variant='contained'
          loading={loading}
          disabled={areFieldsEmpty || selectedReportsGroups.length === 0}
        >
          {userId ? 'Guardar cambios' : 'Crear usuario'}
        </LoadingButton>
      </Grid>
    </Paper>
  )
}

export default ManageUser
