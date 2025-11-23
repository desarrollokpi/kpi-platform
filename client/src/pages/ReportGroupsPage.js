import React from 'react'
import { useSelector } from 'react-redux'
import ReportsGroups from '../components/reports/ReportGroups'
import {
  readReportGroupsByAdmin,
  readReportsByAdmin,
} from '../state/reports/reportsActions'
import { readSectionsByAdmin } from '../state/sections/sectionsActions'
import useRead from './../hooks/useRead'
import Paper from '@mui/material/Paper'
import AddIcon from '@mui/icons-material/Add'
import PositionedButton from './../components/layout/PositionedButton'
import { useNavigate } from 'react-router-dom'
import CreateReportGroupButton from '../components/reports/CreateReportGroupButton'

const ReportGroupsPage = () => {
  useRead(readReportGroupsByAdmin, readReportsByAdmin, readSectionsByAdmin)

  const navigate = useNavigate()

  const { reportsGroups } = useSelector(state => state.reports)

  return (
    <Paper className='container'>
      <ReportsGroups reportsGroups={reportsGroups} />

      <CreateReportGroupButton justifyContent='flex-end'/>
    </Paper>
  )
}

export default ReportGroupsPage
