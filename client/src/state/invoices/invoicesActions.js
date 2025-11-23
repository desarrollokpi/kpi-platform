import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  READ_INVOICES_BY_CONTRACT,
  READ_INVOICES_DETAIL_BY_CONTRACT,
} from './invoicesTypes'

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

export const readInvoicesByContract = contract => async dispatch => {
  setLoading()(dispatch)

  try {
    const res = await axios.get(`/invoices/${contract.id}`)
    dispatch({ type: READ_INVOICES_BY_CONTRACT, payload: res.data })
  } catch (error) {
    dispatch({ type: ERROR, payload: error.response.data.message })
  }
}

export const readInvoicesDetailByContract = contract => async dispatch => {
  setLoading()(dispatch)

  try {
    const res = await axios.get(`/invoices/details/${contract.id}`)
    dispatch({ type: READ_INVOICES_DETAIL_BY_CONTRACT, payload: res.data })
  } catch (error) {
    dispatch({ type: ERROR, payload: error.response.data.message })
  }
}
