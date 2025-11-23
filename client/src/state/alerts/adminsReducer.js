import { ERROR, LOADING, CLEAR_MESSAGE } from './adminsTypes'

const initialState = {
  loading: false,
  message: null,
  admins: [],
}

const adminReducer = (state = initialState, action) => {
  switch (action.type) {
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

export default adminReducer
