import React from 'react'

import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import MuiTextField from '@mui/material/TextField'
import MuiSelect from '@mui/material/Select'
import Checkbox from '@mui/material/Checkbox'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'

const TextField = props => (
  <MuiTextField margin='normal' fullWidth variant='outlined' {...props} />
)

const Select = ({ options, optionValue, display, loading, ...props }) => {
  return (
    <MuiTextField
      margin='normal'
      disabled={loading}
      select
      fullWidth
      {...props}
    >
      {options?.map(option => (
        <MenuItem key={option.id} value={option[optionValue]}>
          {option[display]}
        </MenuItem>
      ))}
    </MuiTextField>
  )
}

const SelectChecked = ({
  options,
  display,
  checked,
  optionValue,
  onChange,
  ...props
}) => (
  <MuiSelect
    margin='normal'
    multiple
    fullWidth
    value={optionValue}
    onChange={onChange}
    renderValue={selected => selected.join(', ')}
    {...props}
  >
    {options.map(option => (
      <MenuItem key={option.id} value={option[optionValue]}>
        <Checkbox checked={checked} />
        <ListItemText>{option[display]}</ListItemText>
      </MenuItem>
    ))}
  </MuiSelect>
)

const FormField = ({ label, children, loading, ...props }) => {
  return (
    <>
      <Grid item md={4} xs={12} {...props}>
        <Typography variant='accent' align='center'>
          <Stack direction='row' spacing={1} alignItems='center'>
            <span>{label}</span> {loading && <CircularProgress size='1rem' />}
          </Stack>
        </Typography>
      </Grid>
      <Grid item md={8} xs={12} {...props}>
        {children}
      </Grid>
    </>
  )
}

FormField.TextField = TextField
FormField.Select = Select
FormField.SelectChecked = SelectChecked

export default FormField
