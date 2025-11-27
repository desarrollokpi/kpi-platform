import React from 'react'
import { Paper, Typography, Box } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useNavigate } from 'react-router-dom'

import WorkspacesList from '../components/workspaces/WorkspacesList'
import PositionedButton from '../components/layout/PositionedButton'
import useSuperuser from '../hooks/useSuperuser'

const WorkspacePage = () => {
  const { isSuperuser } = useSuperuser();
  const navigate = useNavigate()

  const handleCreate = () => {
    const prefix = isSuperuser ? "superusers" : "admins";
    navigate(`/${prefix}/workspaces/create`)
  }

  return (
    <Paper className='container'>
      <Box mb={3}>
        <Typography variant='h5' component='h1' gutterBottom>
          Gestión de Workspaces
        </Typography>
        <Typography variant='body2' color='textSecondary'>
          Administra los workspaces (espacios de trabajo) sincronizados desde Superset
        </Typography>
      </Box>

      <WorkspacesList />

      <PositionedButton onClick={handleCreate} startIcon={<AddIcon />} variant='contained' justifyContent='flex-end'>
        Crear workspace
      </PositionedButton>
    </Paper>
  )
}

export default WorkspacePage
