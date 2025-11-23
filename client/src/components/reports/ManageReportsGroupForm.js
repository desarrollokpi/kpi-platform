import React from 'react'

import { useSelector } from 'react-redux'

import FormField from '../layout/FormField'

import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Switch from '@mui/material/Switch'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import OutlinedInput from '@mui/material/OutlinedInput'

import Select from '@mui/material/Select'
import { stringifySectionKey, renderSectionNames } from '../sections/utils'

const ManageReportsGroupForm = ({
  reportsGroupId,
  bindField,
  bindDropdown,
  active,
  handleSwitchChange,
  thisWorkspaceReports,
  thisReportSections,
  selectedSections,
  handleSectionSelection,
}) => {
  const { loading: reportsLoading } = useSelector(state => state.reports)

  const { workspaces, loading: workspacesLoading } = useSelector(
    state => state.workspaces
  )

  const { sections, loading: sectionsLoading } = useSelector(
    state => state.sections
  )

  const sectionSelectBoxLoading =
    (reportsGroupId &&
      (thisWorkspaceReports.length === 0 || thisReportSections.length === 0)) ||
    sectionsLoading

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Typography variant='h6' align='center' mb={3}>
          Datos generales del grupo:
        </Typography>

        <Grid container alignItems='center'>
          <FormField label='Código' loading={reportsGroupId && reportsLoading}>
            <FormField.TextField
              {...bindField('code')}
              disabled={reportsGroupId && reportsLoading}
            />
          </FormField>

          <FormField label='Nombre' loading={reportsGroupId && reportsLoading}>
            <FormField.TextField
              {...bindField('name')}
              disabled={reportsGroupId && reportsLoading}
            />
          </FormField>

          {/* Active  */}
          <FormField mt={3} label='Activo'>
            <Switch checked={active} onChange={handleSwitchChange} />
          </FormField>
        </Grid>
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant='h6' align='center' mb={3}>
          Secciones asociadas al grupo:
        </Typography>

        <Grid container alignItems='center'>
          {/* Workspace */}
          <FormField
            label='Workspace'
            loading={reportsGroupId && workspacesLoading}
          >
            <FormField.Select
              {...bindDropdown('workspaceId')}
              options={workspaces}
              optionValue='id'
              display='name'
              loading={reportsGroupId && workspacesLoading}
            />
          </FormField>

          <FormField
            label='Reporte'
            loading={reportsGroupId && thisWorkspaceReports.length === 0}
          >
            <FormField.Select
              disabled={reportsGroupId && thisWorkspaceReports.length === 0}
              {...bindDropdown('reportId')}
              options={thisWorkspaceReports}
              optionValue='id'
              display='name'
            />
          </FormField>

          <FormField mt={2} label='Secciones' loading={sectionSelectBoxLoading}>
            <Select
              multiple
              fullWidth
              value={selectedSections}
              onChange={handleSectionSelection}
              input={<OutlinedInput />}
              renderValue={selected =>
                renderSectionNames(selected, sections, sectionSelectBoxLoading)
              }
              disabled={sectionSelectBoxLoading}
            >
              {thisReportSections.map(section => (
                <MenuItem key={section.id} value={stringifySectionKey(section)}>
                  <Checkbox
                    checked={selectedSections.includes(
                      stringifySectionKey(section)
                    )}
                  />
                  <ListItemText primary={section.name} />
                </MenuItem>
              ))}
            </Select>
          </FormField>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default ManageReportsGroupForm
