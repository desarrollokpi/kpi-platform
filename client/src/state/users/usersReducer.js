import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  CREATE,
  READ_ALL,
  UPDATE,
  DELETE,
  UPDATE_PASSWORD,
} from './usersTypes'

const initialState = {
  loading: false,
  message: null,
  users: [],
}

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE:
      return {
        ...state,
        loading: false,
        users: [action.payload, ...state.users],
      }

    case READ_ALL:
      return { ...state, loading: false, users: action.payload }

    case UPDATE:
      return {
        ...state,
        loading: false,
        users: state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        ),
      }

    case DELETE:
      return {
        ...state,
        loading: false,
        users: state.users.filter(user => user._id !== action.payload._id),
      }

    case CLEAR_MESSAGE:
      return { ...state, message: null }

    case LOADING:
      return { ...state, loading: true }

    case ERROR:
      return { ...state, loading: false, message: action.payload }

    case UPDATE_PASSWORD:
      return { ...state, loading: false }

    default:
      return state
  }
}

export default userReducer
