import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  READ_CONTRACT_BY_ADMIN,
  READ_CONTRACT_DETAILS_BY_ADMIN,
  UPDATE_CONTRACT,
  UPDATE_CONTRACT_DETAIL,
} from './contractsTypes'

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

export const readContractByAdmin = () => async dispatch => {
  setLoading()(dispatch)

  try {
    const res = await axios.get(`/contracts`)
    dispatch({ type: READ_CONTRACT_BY_ADMIN, payload: res.data })
  } catch (error) {
    dispatch({ type: ERROR, payload: error.response.data.message })
  }
}

export const readContractDetailsByAdmin = contract => async dispatch => {
  setLoading()(dispatch)

  try {
    const res = await axios.get(`/contracts/details/${contract.id}`)
    dispatch({ type: READ_CONTRACT_DETAILS_BY_ADMIN, payload: res.data })
  } catch (error) {
    dispatch({ type: ERROR, payload: error.response.data.message })
  }
}

export const updateContract = contract => async dispatch => {
  setLoading()(dispatch)
  try {
    const res = await axios.put(`/contracts/${contract.id}`, contract, config)
    dispatch({ type: UPDATE_CONTRACT, payload: res.data })
  } catch (error) {
    handleError(dispatch, error)
  }
}

export const updateContractDetail = contractDetail => async dispatch => {
  setLoading()(dispatch)
  try {
    const res = await axios.put(
      `/contracts/details/${contractDetail.id}`,
      contractDetail,
      config
    )
    dispatch({ type: UPDATE_CONTRACT_DETAIL, payload: contractDetail })
  } catch (error) {
    handleError(dispatch, error)
  }
}
