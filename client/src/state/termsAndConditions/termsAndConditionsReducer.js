import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  READ_TERMS_AND_CONDITIONS,
} from './termsAndConditionsTypes'

const initialState = {
  loading: false,
  message: null,
  termsAndConditions: undefined,
}

const locationsReducer = (state = initialState, action) => {
  switch (action.type) {
    case READ_TERMS_AND_CONDITIONS:
      return {
        ...state,
        termsAndConditions: action.payload,
        loading: false,
      }

    case CLEAR_MESSAGE:
      return { ...state, message: null }

    case LOADING:
      return { ...state, loading: true }

    case ERROR:
      return { ...state, loading: false, message: action.payload }

    default:
      return state
  }
}

export default locationsReducer
