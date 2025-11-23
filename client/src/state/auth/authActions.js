import {
  ERROR,
  LOADING,
  READ_PROFILE,
  SIGN_IN,
  CLEAR_MESSAGE,
  SIGN_OUT,
  TIME_AVAILABLE
} from './authTypes'
import axios from 'axios'

import { config } from '../../util/state'

export const clearMessage = () => dispatch => {
  dispatch({ type: CLEAR_MESSAGE })
}

export const setLoading =
  (loading = true) =>
  dispatch =>
    dispatch({ type: LOADING, payload: loading })

export const signIn = (userType, credentials) => async dispatch => {
  setLoading()(dispatch)

  try {
    const res = await axios.post(`/${userType}/signIn`, credentials, {
      ...config,
      withCredentials: true,
    })
    dispatch({ type: SIGN_IN, payload: res.data })
  } catch (error) {
    dispatch({ type: ERROR, payload: error.response.data.message })
  }
}

export const readProfile = userType => async dispatch => {
  setLoading()(dispatch)

  try {
    const res = await axios.get(`/${userType}/profile`)
    dispatch({ type: READ_PROFILE, payload: res.data })
  } catch (error) {
    dispatch({ type: ERROR, payload: error.response.data.message })
  }
}

export const signOut = userType => async dispatch => {
  setLoading()(dispatch)

  try {
    await axios.post(`/${userType}/signOut`)
    dispatch({ type: SIGN_OUT })
  } catch (error) {
    dispatch({ type: ERROR, payload: error.response.data.message })
  }
}

export const getTimeAvailable = userType => async dispatch => {
  setLoading()(dispatch)

  try {
    const res = await axios.get(`/${userType}/timeAvailable`)
    dispatch({ type: TIME_AVAILABLE, payload: res.data })
  } catch (error) {
    console.log('error', error)
    dispatch({ type: ERROR, payload: error.response.data.message })
  }
}
