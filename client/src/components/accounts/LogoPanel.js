import React, { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { Box, Button, Grid, IconButton, Typography, Stack } from '@mui/material'
import Image from '../layout/Image'
import AccountPanel from './AccountPanel'
import DeleteIcon from '@mui/icons-material/Delete'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import ImageSearchIcon from '@mui/icons-material/ImageSearch'
import { updateLogo } from './../../state/admins/adminsActions'
import { readLogo } from './../../state/auth/authActions'

const LogoPanel = () => {
  const fileLoadElement = useRef()
  const dispatch = useDispatch()
  const [logo, setLogo] = useState(null)
  const { user } = useSelector(state => state.auth)
  const { userLogo } = useSelector(state => state.admins)

  const handleSelectLogo = e => {
    setLogo(e.target.files[0])
  }

  const handleUploadLogo = async e => {
    dispatch(updateLogo(logo, user.name))
    clearLogo()
  }

  const clearLogo = e => {
    setLogo(null)
    fileLoadElement.current.value = ''
  }

  return (
    <AccountPanel title='Logo'>
      <Stack alignItems='center' spacing={3}>
        <Image src={userLogo} alt='logo' />

        <Box textAlign='center'>
          <Button
            component='label'
            startIcon={<ImageSearchIcon />}
            variant='contained'
          >
            {logo ? 'Seleccionar otro logo' : 'Seleccionar nuevo logo'}
            <input
              ref={fileLoadElement}
              accept='image/png, image/jpeg'
              type='file'
              hidden
              onChange={handleSelectLogo}
            />
          </Button>
        </Box>

        <Box>
          {logo && (
            <Stack direction='row' spacing={2} alignItems='center'>
              <Typography>{logo.name}</Typography>
              <IconButton size='small' onClick={clearLogo}>
                <DeleteIcon />
              </IconButton>
            </Stack>
          )}
        </Box>

        {logo && (
          <Box mt={3} textAlign='center'>
            <Button
              onClick={handleUploadLogo}
              startIcon={<FileUploadIcon />}
              variant='contained'
            >
              Subir logo
            </Button>
          </Box>
        )}
      </Stack>
    </AccountPanel>
  )
}

export default LogoPanel
