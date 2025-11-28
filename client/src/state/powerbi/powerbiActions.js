import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  GET_ACCESS_TOKEN,
  GET_REPORT_DATA,
  READ_WORKSPACES_BY_ADMIN,
  READ_REPORTS_BY_ADMIN,
  READ_SECTIONS_BY_ADMIN
} from './powerbiTypes'

import axios from 'axios'

const setLoading = (dispatch, value) => dispatch({ type: LOADING, payload: value })

export const handleError = (dispatch, error) => {
  dispatch({ type: ERROR, payload: error.response.data })
  setTimeout(() => {
    dispatch({ type: CLEAR_MESSAGE, payload: error.response.data.message })
  }, 3000)
}

export const getAccessToken = () => async dispatch => {
  setLoading(dispatch, true)
  try {
    const res = await axios.get('/powerbi/token')
    dispatch({ type: GET_ACCESS_TOKEN, payload: res.data })
  } catch (error) {
    handleError(dispatch, error)
  } finally {
    setLoading(dispatch, false)
  }
}

export const getReportData = (groupId, reportId) => async dispatch => {
  setLoading(dispatch, true)
  try {
    const res = await axios.post('/powerbi/reportData', { groupId, reportId })
    dispatch({ type: GET_REPORT_DATA, payload: res.data })
  } catch (error) {
    handleError(dispatch, error)
  } finally {
    setLoading(dispatch, false)
  }
}

export const getPageData = (groupId, reportId) => async dispatch => {
  setLoading(dispatch, true)
  try {
    const res = await axios.post('/powerbi/reportData', { groupId, reportId })
    dispatch({ type: GET_REPORT_DATA, payload: res.data })
  } catch (error) {
    handleError(dispatch, error)
  } finally {
    setLoading(dispatch, false)
  }
}

export const getGroups = () => async dispatch => {
  setLoading(dispatch, true)
  try {
    const res = await axios.get('/powerbi/workspaces')
    dispatch({ type: GET_REPORT_DATA, payload: res.data })
  } catch (error) {
    handleError(dispatch, error)
  } finally {
    setLoading(dispatch, false)
  }
}

export const getReportsByGroup = groupId => async dispatch => {
  setLoading(dispatch, true)
  try {
    const res = await axios.get(`/powerbi/reportsInGroup?groupId=${groupId}`)
    console.log(res.data)
    dispatch({
      type: READ_REPORTS_BY_ADMIN,
      payload: res.data,
    })
  } catch (error) {
    handleError(dispatch, error)
  } finally {
    setLoading(dispatch, false)
  }
}

export const readSectionsByAdmin = reportId => async dispatch => {
  setLoading(dispatch, true)
  try {
    const res = await axios.get(`/powerbi/pagesInReport?reportId=${reportId}`)
    console.log(res.data)
    dispatch({ type: READ_SECTIONS_BY_ADMIN, payload: res.data })
  } catch (error) {
    handleError(dispatch, error)
  } finally {
    setLoading(dispatch, false)
  }
}


