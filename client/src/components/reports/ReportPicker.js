import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'

import { Grid, Button, Box } from '@mui/material'
import useForm from './../../hooks/useForm'

import {
  readWorkspacesByAdmin,
  clearWorkspaces,
} from './../../state/workspaces/workspacesActions'
import {
  readSectionsByAdmin,
  clearSections,
} from './../../state/sections/sectionsActions'
import {
  readReportsByAdmin,
  clearReports,
} from './../../state/reports/reportsActions'

import Report from './Report'
import Loading from './../layout/Loading'
import FormField from './../layout/FormField'
import useRead from './../../hooks/useRead'

import FullscreenIcon from '@mui/icons-material/Fullscreen'
import { FullScreen, useFullScreenHandle } from 'react-full-screen'

const ReportPicker = () => {
  useRead(
    clearWorkspaces,
    clearSections,
    clearReports,
    readWorkspacesByAdmin,
    readSectionsByAdmin,
    readReportsByAdmin
  )

  const handleFullScreen = useFullScreenHandle()

  const { loading: powerbiLoading } = useSelector(state => state.powerbi)
  const { workspaces, loading } = useSelector(state => state.workspaces)
  const { sections, loading: sectionsLoading } = useSelector(
    state => state.sections
  )
  const { reports, loading: reportsLoading } = useSelector(
    state => state.reports
  )

  const [dropdowns, bindField, areAnyDropdownsEmpty, setDropdowns] = useForm({
    workspaceId: '',
    reportId: '',
    sectionId: '',
  })

  const thisWorkspaceReports = reports.filter(
    report => report.active && report.workspaceId === dropdowns.workspaceId
  )

  const thisReportSections = sections.filter(
    section => section.reportId === dropdowns.reportId
  )

  useEffect(() => {
    if (workspaces.length > 0)
      setDropdowns({ ...dropdowns, workspaceId: workspaces[0].id })
  }, [workspaces.length])

  useEffect(() => {
    if (thisWorkspaceReports.length > 0)
      setDropdowns({ ...dropdowns, reportId: thisWorkspaceReports[0].id })
  }, [thisWorkspaceReports.length])

  useEffect(() => {
    if (thisReportSections.length > 0)
      setDropdowns({ ...dropdowns, sectionId: thisReportSections[0].id })
  }, [thisReportSections.length, dropdowns.reportId])

  if (loading || !workspaces)
    return (
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Loading height={80} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Loading height={80} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Loading height={80} />
        </Grid>
      </Grid>
    )

  return (
    <>
      <Grid container spacing={3} mb={4} alignItems='center'>
        <Grid item xs={12} md={4}>
          <FormField label='Workspace'>
            <FormField.Select
              {...bindField('workspaceId')}
              options={workspaces}
              optionValue='id'
              display='name'
            />
          </FormField>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormField label={'Reporte'} loading={reportsLoading}>
            <FormField.Select
              {...bindField('reportId')}
              options={thisWorkspaceReports}
              optionValue='id'
              display='name'
              loading={reportsLoading || thisWorkspaceReports.length === 0}
            />
          </FormField>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormField label={'Sección'} loading={sectionsLoading}>
            <FormField.Select
              {...bindField('sectionId')}
              options={thisReportSections}
              optionValue='id'
              display='name'
              loading={sectionsLoading || thisReportSections.length === 0}
            />
          </FormField>
        </Grid>
      </Grid>

      {!areAnyDropdownsEmpty && (
        <>
          <Button
            onClick={handleFullScreen.enter}
            variant='contained'
            startIcon={<FullscreenIcon />}
            sx={{ marginBottom: '16px' }}
            disabled={powerbiLoading}
          >
            Pantalla completa
          </Button>

          <FullScreen handle={handleFullScreen}>
            <Box sx={{ backgroundColor: 'white' }}>
              <Report
                workspaceId={dropdowns.workspaceId}
                reportId={dropdowns.reportId}
                sectionId={dropdowns.sectionId}
              />
            </Box>
          </FullScreen>
        </>
      )}
    </>
  )
}

export default ReportPicker
