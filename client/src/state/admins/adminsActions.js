import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  UPDATE_LOGO,
  READ_LOGO,
  READ_LOGO_BY_SUBDOMAIN,
  ACCEPT_TERMS_AND_CONDITIONS,
  CHANGE_USER_PASSWORD,
  READ_USERS_WORKSPACE,
  READ_ADMINS_BY_SUPERUSER,
} from './adminsTypes'

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

export const changeUserPassword = (userId, password) => async dispatch => {
  setLoading()(dispatch)

  try {
    await axios.put(`/admins/changeUserPassword`, { userId, password }, config)
    dispatch({ type: CHANGE_USER_PASSWORD })
  } catch (error) {
    handleError(dispatch, error)
  }
}

export const readLogo = () => async dispatch => {
  setLoading()(dispatch)

  try {
    const res = await axios.get(`/admins/logo`)
    dispatch({ type: READ_LOGO, payload: res.data })
  } catch (error) {
    dispatch({ type: ERROR, payload: error.response.data.message })
  }
}

export const readSubdmain = user => async dispatch => {
  setLoading()(dispatch)
  try {
    const res = await axios.get(`/users/${user}`)
    dispatch({ type: READ_USERS_WORKSPACE, payload: res.data })
  } catch (error) {
    dispatch({ type: ERROR, payload: error.response.data.message })
  }
}

export const readAdminsBySuperuser = user => async dispatch => {
  setLoading()(dispatch)
  try {
    const res = await axios.get(`/admins`)
    dispatch({ type: READ_ADMINS_BY_SUPERUSER, payload: res.data })
  } catch (error) {
    dispatch({ type: ERROR, payload: error.response.data.message })
  }
}

export const acceptTermsAndConditions =
  termsAndConditions => async dispatch => {
    setLoading()(dispatch)

    try {
      const res = await axios.post(
        `/admins/termsAndConditions`,
        { termsAndConditionsId: termsAndConditions.id },
        config
      )
      dispatch({ type: ACCEPT_TERMS_AND_CONDITIONS, payload: res.data })
    } catch (error) {
      dispatch({ type: ERROR, payload: error.response.data.message })
    }
  }

export const readLogoBySubdomain = subdomain => async dispatch => {
  setLoading()(dispatch)
  try {
    const res = await axios.get(
      `/admins/logoBySubdomain?subdomain=${subdomain}`
    )
    dispatch({ type: READ_LOGO_BY_SUBDOMAIN, payload: res.data })
  } catch (error) {
    dispatch({ type: ERROR, payload: error.response.data.message })
  }
}

export const updateLogo = logoFile => async dispatch => {
  setLoading()(dispatch)

  let data = new FormData()
  data.append('image', logoFile)

  try {
    const res = await axios.put(`/admins/logo`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    dispatch({ type: UPDATE_LOGO, payload: res.data.logo })
  } catch (error) {
    handleError(dispatch, error)
  }
}
