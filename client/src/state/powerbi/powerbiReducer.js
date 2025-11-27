import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  GET_ACCESS_TOKEN,
  GET_REPORT_DATA,
  READ_REPORTS_BY_ADMIN,
  READ_SECTIONS_BY_ADMIN
} from './powerbiTypes'

const initialState = {
  loading: false,
  message: null,
  accessToken: undefined,
  reports: [],
  sections:[],
  embedUrl: undefined,
}

const powerbiReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ACCESS_TOKEN:
      return {
        ...state,
        loading: false,
        accessToken: action.payload.token,
      }

    case GET_REPORT_DATA:
      return {
        ...state,
        loading: false,
        embedUrl: action.payload.embedUrl,
        accessToken: action.payload.accessToken,
      }

    case READ_REPORTS_BY_ADMIN:
  
      return { 
        ...state,
         loading: false,
         reports: action.payload 
      }

    case READ_SECTIONS_BY_ADMIN:
        return { 
          ...state, 
          loading: false,
          sections: action.payload 
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

export default powerbiReducer
