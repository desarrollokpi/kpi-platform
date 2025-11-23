import {
  ERROR,
  LOADING,
  READ_PROFILE,
  SIGN_IN,
  CLEAR_MESSAGE,
  SIGN_OUT,
  TIME_AVAILABLE,
} from './authTypes'

import { v4 as uuidv4 } from 'uuid'

const initialState = {
  loading: true,
  message: null,
  isAuthenticated: false,
  user: null,
  userLogo: null,
  timeAvailable: null,
}

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOADING:
      return { ...state, loading: action.payload }

    case SIGN_IN:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload,
      }

    case READ_PROFILE:
      return {
        ...state,
        loading: false,
        user: action.payload,
        isAuthenticated: true,
      }

    case CLEAR_MESSAGE:
      return { ...state, message: null }

    case ERROR:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        message: { text: action.payload, severity: 'error' },
      }

    case SIGN_OUT:
      return {
        ...state,
        isAuthenticated: false,
        user: undefined,
        userLogo: undefined,
        timeAvailable: null,
        loading: false,
      }

    case TIME_AVAILABLE:
      return {
        ...state,
        loading: false,
        timeAvailable: action.payload.time,
      }

    default:
      return state
  }
}

export default authReducer
