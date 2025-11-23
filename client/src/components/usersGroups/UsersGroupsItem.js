/* eslint-disable no-unreachable */
import React from 'react'
import {
  Grid,
  IconButton,
  Collapse,
  ListItem,
  ListItemText,
  Typography,
  ListItemSecondaryAction,
  Box,
} from '@mui/material'

import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import EditIcon from '@mui/icons-material/Edit'
import ActiveIndicator from '../layout/ActiveIndicator'
import VisibilityIcon from '@mui/icons-material/Visibility'
import useResponsive from '../../hooks/useResponsive'
import useToggle from './../../hooks/useToggle'
import UnderConstruction from './../layout/UnderConstruction'
import UsersGroupsUsers from './UsersGroupsUsers'
import UsersGroupsReportsGroups from './UsersGroupsReportsGroups'
import ReportsTable from './../reports/ReportsTable'
import UsersGroupsSections from './UsersGroupsSections'

const UsersGroupsItem = ({ usersGroup }) => {
  const [open, handleToggleCollapse] = useToggle(false)

  const { users } = useSelector(state => state.users)
  const { reportsGroups, reports } = useSelector(state => state.reports)
  const { sections } = useSelector(state => state.sections)

  const navigate = useNavigate()

  const matchMd = useResponsive('md')

  const handleEdit = () => {
    navigate(`/admins/user-groups/update/${usersGroup.id}`)
  }

  const thisUsersGroupUsers = usersGroup.usersIds.map(userId =>
    users.find(user => user.id === userId)
  )

  const thisUsersGroupReportsGroups = usersGroup.reportsGroupsIds.map(
    reportsGroupId =>
      reportsGroups.find(reportGroup => reportGroup.id === reportsGroupId)
  )

  const thisUsersGroupSections = usersGroup.sectionsIds.map(sectionId =>
    sections.find(sections => sections.id === sectionId)
  )

  return (
    <>
      <ListItem dense>
        <Grid container alignItems='center' justifyContent='center'>
          {matchMd && (
            <Grid item md={3}>
              <ListItemText>
                <Typography variant='body1'>{usersGroup.code} </Typography>
              </ListItemText>
            </Grid>
          )}

          <Grid item md={4} xs={9}>
            <ListItemText>
              <Typography variant='body1'>{usersGroup.name}</Typography>
            </ListItemText>
          </Grid>

          {matchMd && (
            <>
              <Grid item md={1}>
                <ListItemText>
                  <Typography variant='body1'>{usersGroup.numUsers}</Typography>
                </ListItemText>
              </Grid>
              <Grid item md={1}>
                <ListItemText>
                  <Typography variant='body1'>
                    {usersGroup.numSections}
                  </Typography>
                </ListItemText>
              </Grid>
              <Grid item md={2}>
                <ListItemText>
                  <ActiveIndicator active={usersGroup.active} />
                </ListItemText>
              </Grid>
            </>
          )}

          <Grid item md={1} xs={3}>
            <ListItemSecondaryAction>
              <IconButton onClick={handleToggleCollapse}>
                <VisibilityIcon color='primary' />
              </IconButton>

              <IconButton onClick={handleEdit}>
                <EditIcon color='success' />
              </IconButton>
            </ListItemSecondaryAction>
          </Grid>
        </Grid>
      </ListItem>

      <Collapse in={open} timeout='auto' unmountOnExit>
        <Box p={matchMd ? 6 : 0} mb={matchMd ? 0 : 3}>
          <Typography mb={3} variant='h6' align='center'>
            Usuarios
          </Typography>
          <UsersGroupsUsers readOnly users={thisUsersGroupUsers} />
          <Typography my={3} mt={4} variant='h6' align='center'>
            Grupos de reportes
          </Typography>
          <UsersGroupsReportsGroups
            readOnly
            reportsGroups={thisUsersGroupReportsGroups}
          />
          <Typography my={3} mt={4} variant='h6' align='center'>
            Secciones
          </Typography>
          <UsersGroupsSections readOnly sections={thisUsersGroupSections} />
        </Box>
      </Collapse>
    </>
  )
}
export default UsersGroupsItem
