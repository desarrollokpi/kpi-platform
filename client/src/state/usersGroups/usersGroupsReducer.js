import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  CREATE,
  READ_ALL,
  UPDATE,
  DELETE,
  READ_INDEPENDENT_SECTIONS_IDS,
} from './usersGroupsTypes'

const initialState = {
  loading: false,
  message: null,
  usersGroups: [],
  independentSections: [],
}

const usersGroupsReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE:
      return {
        ...state,
        loading: false,
        usersgroups: [action.payload, ...state.usersgroups],
      }

    case READ_ALL:
      return { ...state, loading: false, usersGroups: action.payload }

    case READ_INDEPENDENT_SECTIONS_IDS:
      return { ...state, loading: false, independentSections: action.payload }

    case UPDATE:
      return {
        ...state,
        loading: false,
        usersGroups: action.payload,
      }

    case DELETE:
      return {
        ...state,
        loading: false,
        usersgroups: state.usersgroups.filter(
          usersgroup => usersgroup._id !== action.payload._id
        ),
      }

    case CLEAR_MESSAGE:
      return { ...state, message: null }

    case LOADING:
      return { ...state, loading: action.payload }

    case ERROR:
      return { ...state, loading: false, message: action.payload }

    default:
      return state
  }
}

export default usersGroupsReducer
