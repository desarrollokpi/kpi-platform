import { ERROR, LOADING, CLEAR_MESSAGE, UPDATE_LOGO } from './adminsTypes'

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

export const updateLogo = (logoFile, userName) => async dispatch => {
  setLoading()(dispatch)

  let data = new FormData()
  data.append('image', logoFile, userName)

  try {
    const res = await axios.put(`/api/admins/logo`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    dispatch({ type: UPDATE_LOGO, payload: res.data })
  } catch (error) {
    handleError(dispatch, error)
  }
}
