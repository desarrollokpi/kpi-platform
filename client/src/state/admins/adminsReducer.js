import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  READ_LOGO,
  READ_USERS_WORKSPACE,
  READ_ADMINS_BY_SUPERUSER,
  READ_LOGO_BY_SUBDOMAIN,
  UPDATE_LOGO,
  ACCEPT_TERMS_AND_CONDITIONS,
  CHANGE_USER_PASSWORD,
} from './adminsTypes'

const initialState = {
  loading: false,
  message: null,
  userLogo: undefined,
  subdomain: undefined,
  appBarLogo: undefined,
  admins: [],
}

const adminReducer = (state = initialState, action) => {
  switch (action.type) {
    case READ_LOGO:
      return { ...state, userLogo: action.payload, loading: false }

    case READ_LOGO_BY_SUBDOMAIN:
      return { ...state, appBarLogo: action.payload, loading: false }

    case ACCEPT_TERMS_AND_CONDITIONS:
      return { ...state, loading: false }

    case READ_USERS_WORKSPACE:
      return { ...state, subdomain: action.payload, loading: false }

    case READ_ADMINS_BY_SUPERUSER:
      return { ...state, admins: action.payload, loading: false }

    case UPDATE_LOGO:
      return {
        ...state,
        userLogo: action.payload,
        appBarLogo: action.payload,
        loading: false,
      }

    case CLEAR_MESSAGE:
      return { ...state, message: null }

    case LOADING:
      return { ...state, loading: true }

    case ERROR:
      return { ...state, loading: false, message: action.payload }

    case CHANGE_USER_PASSWORD: {
      return { ...state, loading: false }
    }
    default:
      return state
  }
}

export default adminReducer
