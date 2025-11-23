import React from 'react'
import UnderConstruction from '../layout/UnderConstruction'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Switch from '@mui/material/Switch'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import LoadingButton from '@mui/lab/LoadingButton'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'

import FormField from '../layout/FormField'
import useForm from './../../hooks/useForm'
import useToggle from './../../hooks/useToggle'
import useSelectionList from './../../hooks/useSelectionList'
import UsersGroupsUsers from './UsersGroupsUsers'
import { useSelector, useDispatch } from 'react-redux'
import UsersGroupsReportsGroups from './UsersGroupsReportsGroups'
import UsersGroupsSections from './UsersGroupsSections'
import useNavigateAfterAction from './../../hooks/useNavigateAfterAction'
import {
  createUsersGroup,
  updateUsersGroup,
} from './../../state/usersGroups/usersGroupsActions'

const ManageUsersGroups = () => {
  const { users } = useSelector(state => state.users)
  const { reportsGroups } = useSelector(state => state.reports)
  const { sections } = useSelector(state => state.sections)
  const { usersGroups, independentSections, loading } = useSelector(
    state => state.usersGroups
  )
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const initialState = {
    code: '',
    name: '',
  }

  let thisUsersGroup = undefined

  const { usersGroupId } = useParams()

  if (usersGroupId) {
    thisUsersGroup = usersGroups.find(
      user => user.id === parseInt(usersGroupId)
    )
  }

  const buttonHasBeenClicked = useNavigateAfterAction(
    loading,
    '/admins/user-groups'
  )

  const [fields, bindField, areFieldsEmpty] = useForm(
    usersGroupId ? thisUsersGroup : initialState
  )

  const [active, handleSwitchChange] = useToggle(true)

  const [selectedUsers, toggleSelectedUsers] = useSelectionList(
    usersGroupId ? thisUsersGroup.usersIds : []
  )

  const [selectedReportsGroups, toggleSelectedReportsGroups] = useSelectionList(
    usersGroupId ? thisUsersGroup.reportsGroupsIds : []
  )
  const [selectedSections, toggleSelectedSections] = useSelectionList(
    usersGroupId ? thisUsersGroup.sectionsIds : []
  )

  const selectedCountString = list => {
    const count = list.length
    return `${count} seleccionado${count === 1 ? '' : 's'}`
  }

  const handleManageUsersGroup = () => {
    const usersGroup = {
      ...fields,
      users: selectedUsers,
      reportsGroups: selectedReportsGroups,
      sections: selectedSections,
      active,
    }

    // console.log(usersGroup)
    dispatch(
      usersGroupId
        ? updateUsersGroup({ ...usersGroup, id: usersGroupId })
        : createUsersGroup(usersGroup)
    )

    buttonHasBeenClicked()
  }

  const availableIndependentSections = independentSections.map(sectionId =>
    sections.find(sections => sections.id === sectionId)
  )

  return (
    <Paper className='container'>
      <Typography variant='h6' align='center' mb={3}>
        Datos básicos del grupo de usuarios:
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Grid container alignItems='center'>
            <FormField label='Código'>
              <FormField.TextField {...bindField('code')} />
            </FormField>
          </Grid>
        </Grid>

        <Grid item xs={12} md={6}>
          <Grid container alignItems='center'>
            <FormField label='Nombre'>
              <FormField.TextField {...bindField('name')} />
            </FormField>

            <FormField label='Activo'>
              <Switch checked={active} onChange={handleSwitchChange} />
            </FormField>
          </Grid>
        </Grid>
      </Grid>

      <Typography variant='h6' align='center' my={3}>
        Usuarios: {selectedCountString(selectedUsers)}
      </Typography>

      <UsersGroupsUsers
        onChange={toggleSelectedUsers}
        selectedUsers={selectedUsers}
        users={users}
      />

      <Typography variant='h6' align='center' my={3}>
        Grupos de reporte: {selectedCountString(selectedReportsGroups)}
      </Typography>
      <UsersGroupsReportsGroups
        onChange={toggleSelectedReportsGroups}
        selectedReportsGroups={selectedReportsGroups}
        reportsGroups={reportsGroups}
      />

      <Typography variant='h6' align='center' my={3}>
        Secciones: {selectedCountString(selectedSections)}
      </Typography>

      <UsersGroupsSections
        onChange={toggleSelectedSections}
        selectedSections={selectedSections}
        sections={sections}
      />

      <Grid mt={3} container justifyContent='space-between'>
        <Button onClick={() => navigate('/admins/user-groups')}>
          Cancelar
        </Button>
        <LoadingButton
          onClick={handleManageUsersGroup}
          variant='contained'
          disabled={
            areFieldsEmpty ||
            selectedReportsGroups.length === 0 ||
            selectedUsers.length === 0
          }
          loading={loading}
        >
          {usersGroupId ? 'Guardar cambios' : 'Crear grupo de usuarios'}
        </LoadingButton>
      </Grid>
    </Paper>
  )
}

export default ManageUsersGroups
