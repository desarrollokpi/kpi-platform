import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  CREATE,
  READ_INDEPENDENT_SECTIONS_IDS,
  READ_ALL,
  UPDATE,
  DELETE,
} from './usersGroupsTypes'

import axios from 'axios'

import { config } from '../../util/state'

const RESOURCE = 'usersGroups'
const BASE_URL = `/${RESOURCE}`

const setLoading = (dispatch, value) => dispatch({ type: LOADING, payload: value })

export const handleError = (dispatch, error) => {
  dispatch({ type: ERROR, payload: error.response.data })
  setTimeout(() => {
    dispatch({ type: CLEAR_MESSAGE, payload: error.response.data.message })
  }, 3000)
}

export const createUsersGroup = usersGroup => async dispatch => {
  setLoading(dispatch, true)
  try {
    const res = await axios.post(BASE_URL, usersGroup, config)
    dispatch({ type: CREATE, payload: res.data })
  } catch (error) {
    handleError(dispatch, error)
  } finally {
    setLoading(dispatch, false)
  }
}

export const readUsersGroups = () => async dispatch => {
  setLoading(dispatch, true)
  try {
    const res = await axios.get(BASE_URL)
    dispatch({ type: READ_ALL, payload: res.data })
  } catch (error) {
    handleError(dispatch, error)
  } finally {
    setLoading(dispatch, false)
  }
}

export const readIndependentSectionsIds = () => async dispatch => {
  setLoading(dispatch, true)
  try {
    const res = await axios.get(BASE_URL)
    dispatch({ type: READ_INDEPENDENT_SECTIONS_IDS, payload: res.data })
  } catch (error) {
    handleError(dispatch, error)
  } finally {
    setLoading(dispatch, false)
  }
}

export const updateUsersGroup = usersGroup => async dispatch => {
  setLoading(dispatch, true)
  try {
    const res = await axios.put(
      `${BASE_URL}/${usersGroup.id}`,
      usersGroup,
      config
    )
    dispatch({ type: UPDATE, payload: res.data })
  } catch (error) {
    handleError(dispatch, error)
  } finally {
    setLoading(dispatch, false)
  }
}

export const deleteUsersGroup = usersGroup => async dispatch => {
  setLoading(dispatch, true)
  try {
    const res = await axios.delete(`${BASE_URL}/${usersGroup._id}`)
    dispatch({ type: DELETE, payload: res.data })
  } catch (error) {
    handleError(dispatch, error)
  } finally {
    setLoading(dispatch, false)
  }
}
