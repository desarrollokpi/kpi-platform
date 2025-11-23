import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { models } from 'powerbi-client'
import { PowerBIEmbed } from 'powerbi-client-react'

import { getReportData } from './../../state/powerbi/powerbiActions'

import CircularLoading from '../layout/CircularLoading'
import { Box } from '@mui/material';

const settings = {
  filterPaneEnabled: false,
  navContentPaneEnabled: false,
  panes: {
    filters: {
      expanded: true,
      visible: true,
    },
  },
  background: models.BackgroundType.Transparent,
}

const Report = ({ workspaceId, reportId, sectionId, fullScreen }) => {
  const dispatch = useDispatch()

  const { accessToken, embedUrl, loading } = useSelector(state => state.powerbi)

  useEffect(() => {
    dispatch(getReportData(workspaceId, reportId))
  }, [workspaceId, reportId, sectionId, dispatch])


  if (!accessToken || !embedUrl || loading) return <CircularLoading />

  const fullScreenSx = {
    height: "100%",
    width: "100%",
    position: "absolute",
    zIndex: 10000,
    top: 0,
    left: 0,
    overflowY: "hidden",
    backgroundColor: 'white'
  }

  return (
    <>
      <PowerBIEmbed
        embedConfig={{
          id: reportId,
          pageName: sectionId,
          tokenType: models.TokenType.Aad,
          type: 'report',
          embedUrl,
          accessToken,
          settings,
        }}
        cssClassName={'report-container'}
        getEmbeddedComponent={embeddedReport => {
          window.report = embeddedReport
        }}
      />
    </>
  )
}

export default Report
