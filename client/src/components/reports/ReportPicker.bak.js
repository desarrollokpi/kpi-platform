import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'

import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
} from '@mui/material'
import useForm from '../../hooks/useForm'
import { useDispatch } from 'react-redux'

import { readWorkspacesByAdmin } from '../../state/workspaces/workspacesActions'
// import { readSectionsByAdmin } from './../../state/sections/sectionsActions'
// import { readReportsByAdmin } from './../../state/reports/reportsActions'
import {
  getGroups,
  getReportData,
  getPageData,
  getReportsByGroup,
  readSectionsByAdmin,
} from '../../state/powerbi/powerbiActions'
import {
  readLogoBySubdomain,
  readSubdmain,
} from '../../state/admins/adminsActions'
import Report from './Report'
import Loading from '../layout/Loading'
import FormField from '../layout/FormField'
import useRead from '../../hooks/useRead'
import _ from 'lodash'

const ReportPicker = () => {
  const { subdominio } = useSelector(state => state.admins)
  console.log('SUBDOMINIO')
  console.log(subdominio)
  let subdomain = window.location.host

  if (subdomain === 'localhost:3000') {
    subdomain = 'testclient'
  } else {
    subdomain = subdomain.split('.')[0]
  }
  /** get from database */
  // useRead(readWorkspacesByAdmin, readSectionsByAdmin, readReportsByAdmin)

  /** get from powerBy */
  useRead(
    getGroups,
    getReportData,
    getPageData,
    readWorkspacesByAdmin,
    readSubdmain
  )

  let { workspaces, loading } = useSelector(state => state.workspaces)

  const dispatch = useDispatch()
  /**
   * Llama todos los reports y los guarda en el 'store' desde la base de datos
   */
  // const { reports } = useSelector(state => state.reports)

  //** llama los reports de powerBi */
  const { reports } = useSelector(state => state.powerbi)
  const { sections } = useSelector(state => state.powerbi)

  const [dropdowns, bindField, areAnyDropdownsEmpty, setDropdowns] = useForm({
    workspaceId: '',
    reportId: '',
    sectionId: '',
  })

  useEffect(() => {
    console.log(subdomain)
    dispatch(readSubdmain(subdomain))
    dispatch(readLogoBySubdomain(subdomain))
  }, [])

  /** Change if parameter in array is changed workspace */
  useEffect(() => {
    setDropdowns({ ...dropdowns, sectionId: '' })
    dispatch(getReportsByGroup(dropdowns.workspaceId))
  }, [dropdowns.workspaceId])

  useEffect(() => {
    setDropdowns({ ...dropdowns })
    dispatch(readSectionsByAdmin(dropdowns.reportId))
  }, [dropdowns.reportId])

  /** Get elements for combox */
  const thisWorkspaceReports = reports ? reports : null
  /** Get elements for combox */
  const thisReportSections = sections ? sections : null
  console.log('WW')
  console.log(workspaces.length)
  let count = workspaces.length
  let count2 = subdominio.length
  let subdomainWorkspaces = []
  for (let i = 0; i < count; i++) {
    for (let j = 0; j < count2; j++) {
      if (workspaces[i].id === subdominio[j].id_workspace) {
        subdomainWorkspaces[i] = workspaces[i]
      }
    }
  }
  console.log('SUBW')
  console.log(subdomainWorkspaces)
  // console.log(workspaces)

  // const thisWorkspaceReports = workspaces.find(
  //   workspaces => workspace.id === dropdowns.workspaceId
  // ).pbiGroupId

  // const pbiReportId = reports.find(report => report.id === dropdowns.reportId).pbiReportId

  // const thisReportSections = sections.find(
  //   section => section.id === dropdowns.reportId
  // ).pbiSectionId

  // const pbiSectionName = sections.find(
  //   section => section.id === dropdowns.reportId
  // ).pbiSectionId

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
              options={subdomainWorkspaces}
              optionValue='id'
              display='name'
            />
          </FormField>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormField label='Reporte'>
            <FormField.Select
              {...bindField('reportId')}
              options={thisWorkspaceReports}
              optionValue='id'
              display='name'
            />
          </FormField>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormField label='Sección'>
            <FormField.Select
              {...bindField('sectionId')}
              options={thisReportSections}
              optionValue='Name'
              display='displayName'
            />
          </FormField>
        </Grid>
      </Grid>

      {!areAnyDropdownsEmpty && (
        <Report
          workspaceId={dropdowns.workspaceId}
          reportId={dropdowns.reportId}
          sectionId={dropdowns.sectionId}
        />
      )}
    </>
  )
}

export default ReportPicker
