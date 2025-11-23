import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  READ_WORKSPACES_BY_ADMIN,
  READ_WORKSPACES_BY_USER,
  CLEAR_WORKSPACES,
} from './workspacesTypes'

import axios from 'axios'

export const handleError = (dispatch, error) => {
  dispatch({ type: ERROR, payload: error.response.data })
  setTimeout(() => {
    dispatch({ type: CLEAR_MESSAGE, payload: error.response.data.message })
  }, 3000)
}

export const setLoading = () => dispatch => {
  return dispatch({ type: LOADING })
}

export const clearWorkspaces = () => dispatch => {
  return dispatch({ type: CLEAR_WORKSPACES })
}

export const readWorkspacesByAdmin = () => async dispatch => {
  setLoading()(dispatch)
  try {
    const res = await axios.get('/workspaces')
    dispatch({ type: READ_WORKSPACES_BY_ADMIN, payload: res.data })
  } catch (error) {
    handleError(dispatch, error)
  }
}

export const readWorkspacesByUser = () => async dispatch => {
  setLoading()(dispatch)
  try {
    const res = await axios.get('/workspaces/users')
    dispatch({ type: READ_WORKSPACES_BY_USER, payload: res.data })
  } catch (error) {
    handleError(dispatch, error)
  }
}
