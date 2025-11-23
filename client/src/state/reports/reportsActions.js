import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  CREATE_REPORTS_GROUP,
  READ_REPORT_GROUPS_BY_ADMIN,
  READ_REPORTS_BY_ADMIN,
  READ_REPORTS_BY_USER,
  READ_ACCOUNT_REPORTS_BY_ADMIN,
  READ_USERS_REPORTS_BY_ADMIN,
  UPDATE_REPORT_ACTIVE_STATE_BY_ADMIN,
  UPDATE_REPORTS_GROUP,
  CLEAR_REPORTS,
} from './reportsTypes'

import axios from 'axios'

import { config } from '../../util/state'

export const handleError = (dispatch, error) => {
  dispatch({ type: ERROR, payload: error.response.data })
  setTimeout(() => {
    dispatch({
      type: CLEAR_MESSAGE,
      payload: error.response.data.message,
    })
  }, 3000)
}

export const setLoading = () => dispatch => {
  return dispatch({ type: LOADING })
}

export const clearReports = () => dispatch => {
  return dispatch({ type: CLEAR_REPORTS })
}

export const readReportGroupsByAdmin = () => async dispatch => {
  setLoading()(dispatch)
  try {
    const res = await axios.get('/reports/groups')
    dispatch({
      type: READ_REPORT_GROUPS_BY_ADMIN,
      payload: res.data,
    })
  } catch (error) {
    handleError(dispatch, error)
  }
}

export const readReportsByAdmin = () => async dispatch => {
  setLoading()(dispatch)
  try {
    const res = await axios.get('/reports')
    dispatch({
      type: READ_REPORTS_BY_ADMIN,
      payload: res.data,
    })
  } catch (error) {
    handleError(dispatch, error)
  }
}

export const readReportsByUser = () => async dispatch => {
  setLoading()(dispatch)
  try {
    const res = await axios.get('/reports/users')
    dispatch({
      type: READ_REPORTS_BY_USER,
      payload: res.data,
    })
  } catch (error) {
    handleError(dispatch, error)
  }
}

export const readAccountReportsByAdmin = () => async dispatch => {
  setLoading()(dispatch)
  try {
    const res = await axios.get('/reports/account')
    dispatch({
      type: READ_ACCOUNT_REPORTS_BY_ADMIN,
      payload: res.data,
    })
  } catch (error) {
    handleError(dispatch, error)
  }
}

// deprecated
// export const readUsersReportsByAdmin = () => async dispatch => {
//   setLoading()(dispatch)
//   try {
//     const res = await axios.get('/reports/users')
//     dispatch({
//       type: READ_USERS_REPORTS_BY_ADMIN,
//       payload: res.data,
//     })
//   } catch (error) {
//     handleError(dispatch, error)
//   }
// }

export const updateReportActiveStateByAdmin =
  (active, reportId, workspaceId) => async dispatch => {
    setLoading()(dispatch)

    try {
      const res = await axios.put(
        `/reports/toggleActive/${reportId}`,
        { active, workspaceId },
        config
      )
      dispatch({ type: UPDATE_REPORT_ACTIVE_STATE_BY_ADMIN, payload: res.data })
    } catch (error) {
      dispatch({ type: ERROR, payload: error.response.data.message })
    }
  }

export const updateReportsGroup = reportsGroup => async dispatch => {
  setLoading()(dispatch)

  try {
    const res = await axios.put(
      `/reports/groups/${reportsGroup.id}`,
      reportsGroup,
      config
    )
    dispatch({ type: UPDATE_REPORTS_GROUP, payload: res.data })
  } catch (error) {
    dispatch({ type: ERROR, payload: error.response.data.message })
  }
}

export const createReportsGroup = reportsGroup => async dispatch => {
  setLoading()(dispatch)

  try {
    const res = await axios.post(`/reports/groups/`, reportsGroup, config)
    dispatch({ type: CREATE_REPORTS_GROUP, payload: res.data })
  } catch (error) {
    dispatch({ type: ERROR, payload: error.response.data.message })
  }
}
