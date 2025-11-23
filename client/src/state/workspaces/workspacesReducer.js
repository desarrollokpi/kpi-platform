import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  READ_WORKSPACES_BY_ADMIN,
  READ_WORKSPACES_BY_USER,
  CLEAR_WORKSPACES,
} from './workspacesTypes'

const initialState = {
  loading: false,
  message: null,
  workspaces: [],
  userWorkspaces: [],
}

const workspacesReducer = (state = initialState, action) => {
  switch (action.type) {
    case READ_WORKSPACES_BY_ADMIN:
      return {
        ...state,
        loading: false,
        workspaces: action.payload,
      }

    case READ_WORKSPACES_BY_USER:
      return {
        ...state,
        loading: false,
        userWorkspaces: action.payload,
      }

    case CLEAR_MESSAGE:
      return { ...state, message: null }

    case CLEAR_WORKSPACES:
      return { ...state, workspaces: [], userWorkspaces: [] }

    case LOADING:
      return { ...state, loading: true }

    case ERROR:
      return { ...state, loading: false, message: action.payload }

    default:
      return state
  }
}

export default workspacesReducer
