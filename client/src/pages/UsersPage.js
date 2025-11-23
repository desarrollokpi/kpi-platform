import React from 'react'
import Users from '../components/users/Users'
import { readUsers } from '../state/users/usersActions'
import {
  readReportGroupsByAdmin,
  // readUsersReportsByAdmin,
} from '../state/reports/reportsActions'
import useRead from './../hooks/useRead'
import { useNavigate } from 'react-router-dom'

import Paper from '@mui/material/Paper'
import AddIcon from '@mui/icons-material/Add'
import PositionedButton from './../components/layout/PositionedButton'

const UsersPage = () => {
  useRead(readUsers, readReportGroupsByAdmin)

  const navigate = useNavigate()

  return (
    <Paper className='container'>
      <Users />
      
      <PositionedButton
        onClick={() => navigate('/admins/users/create')}
        startIcon={<AddIcon />}
        variant='contained'
        justifyContent='flex-end'
      >
        Agregar nuevo usuario
      </PositionedButton>
    </Paper>
  )
}

export default UsersPage
