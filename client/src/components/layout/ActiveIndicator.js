import React from 'react'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'

const ActiveIndicator = ({ active }) => {
  if (active === 1) return <CheckCircleOutlineIcon color='success' />

  return <HighlightOffIcon color='error' />
}

export default ActiveIndicator
