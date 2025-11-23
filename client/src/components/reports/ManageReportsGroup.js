import React, { useEffect } from 'react'

import useForm from '../../hooks/useForm'
import useToggle from '../../hooks/useToggle'
import { useSelector, useDispatch } from 'react-redux'

import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'

import { useNavigate } from 'react-router-dom'

import {
  readReportGroupsByAdmin,
  readReportsByAdmin,
  updateReportsGroup,
  createReportsGroup,
} from '../../state/reports/reportsActions'

import { readWorkspacesByAdmin } from '../../state/workspaces/workspacesActions'
import { readSectionsByAdmin } from '../../state/sections/sectionsActions'
import { useParams } from 'react-router-dom'
import ManageReportsGroupTable from './ManageReportsGroupTable'
import ManageReportsGroupForm from './ManageReportsGroupForm'
import useSelectionList from './../../hooks/useSelectionList'
import LoadingButton from '@mui/lab/LoadingButton'
import useNavigateAfterAction from './../../hooks/useNavigateAfterAction'

import useConditionalRead from '../../hooks/useConditionalRead'
import { stringifySectionKeys, parseSectionKeys } from '../sections/utils'

const ManageReportsGroup = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {
    reportsGroups,
    reports,
    loading: reportsLoading,
  } = useSelector(state => state.reports)

  const { workspaces } = useSelector(state => state.workspaces)
  const { sections } = useSelector(state => state.sections)

  useConditionalRead([
    { fn: readReportGroupsByAdmin, condition: reportsGroups.length === 0 },
    { fn: readWorkspacesByAdmin, condition: workspaces.length === 0 },
    { fn: readSectionsByAdmin, condition: sections.length === 0 },
    { fn: readReportsByAdmin, condition: reports.length === 0 },
  ])

  const buttonHasBeenClicked = useNavigateAfterAction(
    reportsLoading,
    '/admins/reports-groups'
  )

  const { reportsGroupId } = useParams()

  let thisReportsGroup = undefined

  if (reportsGroupId) {
    thisReportsGroup = reportsGroups.find(
      reportsGroup => reportsGroup.id === parseInt(reportsGroupId)
    )
  }

  const [active, handleSwitchChange] = useToggle(true)

  const [selectedSections, toggleSelectedSection, setSelectedSections] =
    useSelectionList([])

  const [reportGroup, bindField, areFieldsEmpty, setReportGroup] = useForm({
    code: '',
    name: '',
  })

  const [dropdowns, bindDropdown, _, setDropdowns] = useForm({
    workspaceId: '',
    reportId: '',
  })

  const thisWorkspaceReports = reports.filter(
    report => report.workspaceId === dropdowns.workspaceId
  )

  const thisReportSections = sections.filter(
    section => section.reportId === dropdowns.reportId
  )

  const handleManageReportsGroup = () => {
    const reportsGroupData = {
      ...reportGroup,
      active,
      sections: parseSectionKeys(selectedSections),
    }

    console.log('reportsGroupData', reportsGroupData)

    dispatch(
      reportsGroupId
        ? updateReportsGroup(reportsGroupData)
        : createReportsGroup(reportsGroupData)
    )

    buttonHasBeenClicked()
  }

  const handleSectionSelection = e => {
    setSelectedSections(
      typeof e.target.value === 'string'
        ? e.target.value.split(',')
        : e.target.value
    )
  }

  useEffect(() => {
    if (workspaces.length > 0)
      setDropdowns({
        ...dropdowns,
        workspaceId: workspaces[0].id,
      })
  }, [workspaces.length])

  useEffect(() => {
    if (thisWorkspaceReports.length > 0)
      setDropdowns({ ...dropdowns, reportId: thisWorkspaceReports[0].id })
  }, [thisWorkspaceReports.length])

  useEffect(() => {
    if (thisReportsGroup) {
      setReportGroup(thisReportsGroup)
      setSelectedSections(stringifySectionKeys(thisReportsGroup.sections))
    }
  }, [reportsGroupId, thisReportsGroup])

  return (
    <Paper className='container'>
      <ManageReportsGroupForm
        reportsGroupId={reportsGroupId}
        bindField={bindField}
        bindDropdown={bindDropdown}
        active={active}
        handleSwitchChange={handleSwitchChange}
        thisWorkspaceReports={thisWorkspaceReports}
        thisReportSections={thisReportSections}
        selectedSections={selectedSections}
        handleSectionSelection={handleSectionSelection}
      />

      <ManageReportsGroupTable
        sections={selectedSections}
        onChange={toggleSelectedSection}
      />

      <Grid mt={4} container justifyContent='space-between'>
        <Button onClick={() => navigate('/admins/reports-groups')}>
          Cancelar
        </Button>

        <LoadingButton
          loading={reportsLoading}
          onClick={handleManageReportsGroup}
          variant='contained'
          disabled={areFieldsEmpty || selectedSections.length === 0}
        >
          {reportsGroupId ? 'Guardar cambios' : 'Crear grupo de reportes'}
        </LoadingButton>
      </Grid>
    </Paper>
  )
}

export default ManageReportsGroup
