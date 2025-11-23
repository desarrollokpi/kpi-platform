import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  READ_TERMS_AND_CONDITIONS,
} from './termsAndConditionsTypes'

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

export const readTermsAndConditions = () => async dispatch => {
  setLoading()(dispatch)

  try {
    const res = await axios.get(`/termsAndConditions`)
    dispatch({ type: READ_TERMS_AND_CONDITIONS, payload: res.data })
  } catch (error) {
    dispatch({ type: ERROR, payload: error.response.data.message })
  }
}
