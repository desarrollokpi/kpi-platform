import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  CREATE,
  READ_ALL,
  UPDATE,
  UPDATE_PASSWORD,
} from './usersTypes'

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

export const createUser = user => async dispatch => {
  setLoading()(dispatch)

  try {
    const res = await axios.post(`/users`, user, config)
    dispatch({ type: CREATE, payload: res.data })
  } catch (error) {
    handleError(dispatch, error)
  }
}

export const readUsers = () => async dispatch => {
  setLoading()(dispatch)

  try {
    const res = await axios.get('/users')
    dispatch({ type: READ_ALL, payload: res.data })
  } catch (error) {
    handleError(dispatch, error)
  }
}

export const updateUser = user => async dispatch => {
  setLoading()(dispatch)

  try {
    const res = await axios.put(`/users/${user.id}`, user, config)
    dispatch({ type: UPDATE, payload: res.data })
  } catch (error) {
    handleError(dispatch, error)
  }
}

export const updateUserPasswordByUser = password => async dispatch => {
  setLoading()(dispatch)

  try {
    const res = await axios.put(`/users/changePassword`, { password }, config)
    dispatch({ type: UPDATE_PASSWORD, payload: res.data })
  } catch (error) {
    handleError(dispatch, error)
  }
}
