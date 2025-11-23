import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  READ_CURRENCIES,
} from './currenciesTypes'

const initialState = {
  loading: false,
  message: null,
  currencies: [],
}

const locationsReducer = (state = initialState, action) => {
  switch (action.type) {
    case READ_CURRENCIES:
      return {
        ...state,
        currencies: action.payload,
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
