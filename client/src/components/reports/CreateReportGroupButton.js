import React from 'react'

import AddIcon from '@mui/icons-material/Add'
import PositionedButton from '@layout/PositionedButton'
import { useNavigate } from 'react-router-dom'

const CreateReportGroupButton = ({justifyContent}) => {
  const navigate = useNavigate()

  return (
    <PositionedButton
      onClick={() => navigate('/admins/reports-groups/create')}
      startIcon={<AddIcon />}
      variant='contained'
      justifyContent={justifyContent}
    >
      Agregar nuevo grupo
    </PositionedButton>
  )
}

export default CreateReportGroupButton
