import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  READ_INVOICES_BY_CONTRACT,
  READ_INVOICES_DETAIL_BY_CONTRACT,
} from './invoicesTypes'

import axios from 'axios'

export const handleError = (dispatch, error) => {
  dispatch({ type: ERROR, payload: error.response.data })
  setTimeout(() => {
    dispatch({ type: CLEAR_MESSAGE, payload: error.response.data.message })
  }, 3000)
}

const setLoading = (dispatch, value) => dispatch({ type: LOADING, payload: value })

export const readInvoicesByContract = contract => async dispatch => {
  setLoading(dispatch, true)

  try {
    const res = await axios.get(`/invoices/${contract.id}`)
    dispatch({ type: READ_INVOICES_BY_CONTRACT, payload: res.data })
  } catch (error) {
    dispatch({ type: ERROR, payload: error.response.data.message })
  } finally {
    setLoading(dispatch, false)
  }
}

export const readInvoicesDetailByContract = contract => async dispatch => {
  setLoading(dispatch, true)

  try {
    const res = await axios.get(`/invoices/details/${contract.id}`)
    dispatch({ type: READ_INVOICES_DETAIL_BY_CONTRACT, payload: res.data })
  } catch (error) {
    dispatch({ type: ERROR, payload: error.response.data.message })
  } finally {
    setLoading(dispatch, false)
  }
}
