import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  CREATE,
  UPDATE,
  READ_SECTIONS_BY_ADMIN,
  READ_SECTIONS_BY_USER,
  DELETE,
  CLEAR_SECTIONS,
} from './sectionsTypes'

import axios from 'axios'

import { config } from '../../util/state'

export const handleError = (dispatch, error) => {
  dispatch({ type: ERROR, payload: error.response.data })
  setTimeout(() => {
    dispatch({ type: CLEAR_MESSAGE, payload: error.response.data.message })
  }, 3000)
}

export const setLoading = () => dispatch => {
  return dispatch({ type: LOADING })
}

export const clearSections = () => dispatch => {
  return dispatch({ type: CLEAR_SECTIONS })
}

export const createSection = section => async dispatch => {
  setLoading()(dispatch)
  try {
    const res = await axios.post(`/powerbi/sections`, section, config)
    dispatch({ type: CREATE, payload: res.data })
  } catch (error) {
    handleError(dispatch, error)
  }
}

export const readSectionsByAdmin = () => async dispatch => {
  setLoading()(dispatch)
  try {
    const res = await axios.get('/sections')
    dispatch({ type: READ_SECTIONS_BY_ADMIN, payload: res.data })
  } catch (error) {
    handleError(dispatch, error)
  }
}

export const readSectionsByUser = () => async dispatch => {
  setLoading()(dispatch)
  try {
    const res = await axios.get('/sections/users')
    dispatch({ type: READ_SECTIONS_BY_USER, payload: res.data })
  } catch (error) {
    handleError(dispatch, error)
  }
}

export const updateSection = section => async dispatch => {
  setLoading()(dispatch)
  try {
    const res = await axios.put(`/sections/${section._id}`, section, config)
    dispatch({ type: UPDATE, payload: res.data })
  } catch (error) {
    handleError(dispatch, error)
  }
}

export const deleteSection = section => async dispatch => {
  setLoading()(dispatch)
  try {
    const res = await axios.delete(`/sections/${section._id}`)
    dispatch({ type: DELETE, payload: res.data })
  } catch (error) {
    handleError(dispatch, error)
  }
}
