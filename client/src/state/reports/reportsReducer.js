import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  CREATE_REPORTS_GROUP,
  READ_REPORT_GROUPS_BY_ADMIN,
  READ_REPORTS_BY_ADMIN,
  READ_REPORTS_BY_USER,
  READ_ACCOUNT_REPORTS_BY_ADMIN,
  READ_USERS_REPORTS_BY_ADMIN,
  UPDATE_REPORT_ACTIVE_STATE_BY_ADMIN,
  UPDATE_REPORTS_GROUP,
  CLEAR_REPORTS,
  CREATE_REPORT,
  UPDATE_REPORT,
  GET_REPORT_BY_ID,
  DELETE_REPORT,
  GET_WORKSPACES_LIST,
} from './reportsTypes'

const initialState = {
  loading: false,
  message: null,
  reports: [],
  report: null,
  totalCount: 0,
  reportsGroups: [],
  accountReports: [],
  userReports: [],
  workspacesList: [],
}

const reportReducer = (state = initialState, action) => {
  switch (action.type) {
    case READ_REPORT_GROUPS_BY_ADMIN:
      return { ...state, loading: false, reportsGroups: action.payload }

    case READ_REPORTS_BY_ADMIN:
      return {
        ...state,
        loading: false,
        reports: action.payload.reports || action.payload,
        totalCount: action.payload.totalCount || (action.payload.reports || action.payload).length
      }

    case READ_REPORTS_BY_USER:
      return { ...state, loading: false, userReports: action.payload }

    case READ_ACCOUNT_REPORTS_BY_ADMIN:
      return { ...state, loading: false, accountReports: action.payload }

    case READ_USERS_REPORTS_BY_ADMIN:
      return { ...state, loading: false, usersReports: action.payload }

    case UPDATE_REPORT_ACTIVE_STATE_BY_ADMIN:
      return { ...state, loading: false, accountReports: action.payload }

    case CREATE_REPORTS_GROUP:
      return { ...state, loading: false }

    case UPDATE_REPORTS_GROUP:
      return {
        ...state,
        loading: false,
        reportsGroups: action.payload,
      }

    case CLEAR_MESSAGE:
      return { ...state, message: null }

    case CLEAR_REPORTS:
      return { ...state, reports: [], userReports: [] }

    case GET_REPORT_BY_ID:
      return {
        ...state,
        loading: false,
        report: action.payload,
      }

    case CREATE_REPORT:
      return {
        ...state,
        reports: [...state.reports, action.payload],
        report: action.payload,
        loading: false,
        message: 'Reporte creado exitosamente',
      }

    case UPDATE_REPORT:
      return {
        ...state,
        reports: state.reports.map((report) =>
          report.id === action.payload.id ? action.payload : report
        ),
        report: action.payload,
        loading: false,
        message: 'Reporte actualizado exitosamente',
      }

    case DELETE_REPORT:
      return {
        ...state,
        reports: state.reports.filter((report) => report.id !== action.payload.reportId),
        loading: false,
        message: action.payload.message || 'Reporte eliminado exitosamente',
      }

    case GET_WORKSPACES_LIST:
      return {
        ...state,
        loading: false,
        workspacesList: action.payload,
      }

    case LOADING:
      return { ...state, loading: action.payload }

    case ERROR:
      return { ...state, loading: false, message: action.payload }

    default:
      return state
  }
}

export default reportReducer
