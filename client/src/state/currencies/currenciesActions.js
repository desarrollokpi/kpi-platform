import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  READ_CURRENCIES,
} from './currenciesTypes'

import axios from 'axios'

const setLoading = (dispatch, value) => dispatch({ type: LOADING, payload: value })

export const handleError = (dispatch, error) => {
  dispatch({ type: ERROR, payload: error.response.data })
  setTimeout(() => {
    dispatch({ type: CLEAR_MESSAGE, payload: error.response.data.message })
  }, 3000)
}

export const readCurrencies = () => async dispatch => {
  setLoading(dispatch, true)

  try {
    const res = await axios.get(`/currencies`)
    dispatch({ type: READ_CURRENCIES, payload: res.data })
  } catch (error) {
    dispatch({ type: ERROR, payload: error.response.data.message })
  } finally {
    setLoading(dispatch, false)
  }
}
