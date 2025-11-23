import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  READ_COUNTRIES,
  READ_REGIONS,
  READ_ZONES,
} from './locationsTypes'

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

export const readCountries = () => async dispatch => {
  setLoading()(dispatch)

  try {
    const res = await axios.get(`/locations/countries`)
    dispatch({ type: READ_COUNTRIES, payload: res.data })
  } catch (error) {
    dispatch({ type: ERROR, payload: error.response.data.message })
  }
}

export const readRegions = () => async dispatch => {
  setLoading()(dispatch)

  try {
    const res = await axios.get(`/locations/regions`)
    dispatch({ type: READ_REGIONS, payload: res.data })
  } catch (error) {
    dispatch({ type: ERROR, payload: error.response.data.message })
  }
}

export const readZones = () => async dispatch => {
  setLoading()(dispatch)

  try {
    const res = await axios.get(`/locations/zones`)
    dispatch({ type: READ_ZONES, payload: res.data })
  } catch (error) {
    dispatch({ type: ERROR, payload: error.response.data.message })
  }
}
