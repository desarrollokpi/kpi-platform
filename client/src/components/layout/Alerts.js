import React, { useEffect, useState, useRef } from 'react'

import MuiAlert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Collapse from '@mui/material/Collapse'
import { useSelector, useDispatch } from 'react-redux'

import { clearMessage } from './../../state/auth/authActions'

const TIMEOUT = 4500

const Alerts = () => {
  const dispatch = useDispatch()
  const { message, loading } = useSelector(state => state.auth)

  const [show, setShow] = useState(false)

  useEffect(() => {
    if (message && !show) {
      setShow(true)

      setTimeout(() => setShow(false), TIMEOUT - 500)

      setTimeout(() => dispatch(clearMessage()), TIMEOUT)
    }
  }, [message])

  return (
    <>
      <Collapse in={show}>
        <Box my={2}>
          <Stack alignItems='center'>
            {message && (
              <MuiAlert severity={message.severity}>{message.text}</MuiAlert>
            )}
          </Stack>
        </Box>
      </Collapse>
    </>
  )
}

export default Alerts
