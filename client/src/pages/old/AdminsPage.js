import React from 'react'

import useRead from '@hooks/useRead'
import { readAdminsBySuperuser } from '../../state/admins/adminsActions'

import Admins from '../../components/admins/Admins'

import PositionedButton from '../../components/layout/PositionedButton'
import Paper from '@mui/material/Paper'
import AddIcon from '@mui/icons-material/Add'

const AdminsPage = () => {
  useRead(readAdminsBySuperuser)

  const handleCreateAdmin = () => {
    console.log('handleCreateAdmin')
  }

  return (
    <Paper className='container'>
      <Admins />
      <PositionedButton
        onClick={handleCreateAdmin}
        startIcon={<AddIcon />}
        variant='contained'
        justifyContent='flex-end'
      >
        Agregar nuevo administrador
      </PositionedButton>
    </Paper>
  )
}

export default AdminsPage
