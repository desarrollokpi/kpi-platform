import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  READ_IDENTIFICATION_DOCUMENTS,
} from './identificationDocumentsTypes'

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

export const readIdentificationDocuments = () => async dispatch => {
  setLoading()(dispatch)

  try {
    const res = await axios.get(`/identificationDocuments`)
    dispatch({ type: READ_IDENTIFICATION_DOCUMENTS, payload: res.data })
  } catch (error) {
    dispatch({ type: ERROR, payload: error.response.data.message })
  }
}
