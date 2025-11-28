import {
  LOADING,
  ERROR,
  CLEAR_MESSAGE,
  GET_ALL_DASHBOARDS,
  GET_DASHBOARD_BY_ID,
  CREATE_DASHBOARD,
  UPDATE_DASHBOARD,
  DELETE_DASHBOARD,
  ACTIVATE_DASHBOARD,
  GET_DASHBOARDS_BY_USER,
  GET_DASHBOARD_EMBED_INFO,
  GET_DASHBOARD_USERS,
  ASSIGN_DASHBOARD_TO_USER,
  REMOVE_DASHBOARD_FROM_USER,
  EXPORT_DASHBOARD_CSV,
  SEND_DASHBOARD_EMAIL,
  GET_DASHBOARD_EMBEDDED_CONFIG,
  GET_REPORTS_LISTS,
  GET_DASHBOARDS_INSTANCES,
} from "./dashboardsTypes";

const initialState = {
  loading: false,
  message: null,
  dashboards: [],
  dashboard: null,
  totalCount: 0,
  embedInfo: null,
  embeddedConfig: null,
  dashboardUsers: [],
  reportsList: [],
  dashboardsInstancesList: [],
};

const dashboardsReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOADING:
      return { ...state, loading: action.payload };

    case CLEAR_MESSAGE:
      return { ...state, message: null };

    case ERROR:
      return {
        ...state,
        loading: false,
        message: action.payload,
      };

    case GET_ALL_DASHBOARDS:
      return {
        ...state,
        dashboards: action.payload.dashboards || action.payload,
        totalCount: action.payload.totalCount || (action.payload.dashboards ? action.payload.dashboards.length : action.payload.length),
        loading: false,
      };

    case GET_DASHBOARD_BY_ID:
      return {
        ...state,
        dashboard: action.payload,
        loading: false,
      };

    case CREATE_DASHBOARD:
      return {
        ...state,
        dashboards: [...state.dashboards, action.payload],
        dashboard: action.payload,
        loading: false,
        message: "Dashboard creado exitosamente",
      };

    case UPDATE_DASHBOARD:
      return {
        ...state,
        dashboards: state.dashboards.map((dashboard) => (dashboard.id === action.payload.id ? action.payload : dashboard)),
        dashboard: action.payload,
        loading: false,
        message: "Dashboard actualizado exitosamente",
      };

    case DELETE_DASHBOARD:
      return {
        ...state,
        dashboards: state.dashboards.filter((dashboard) => dashboard.id !== action.payload.dashboardId),
        loading: false,
        message: action.payload.message || "Dashboard eliminado exitosamente",
      };

    case ACTIVATE_DASHBOARD:
      return {
        ...state,
        dashboards: state.dashboards.map((dashboard) => (dashboard.id === action.payload.id ? action.payload : dashboard)),
        dashboard: action.payload,
        loading: false,
        message: "Dashboard activado exitosamente",
      };

    case GET_DASHBOARDS_BY_USER:
      return {
        ...state,
        dashboards: action.payload.dashboards || action.payload,
        totalCount: action.payload.count || (action.payload.dashboards ? action.payload.dashboards.length : action.payload.length),
        loading: false,
      };

    case GET_DASHBOARD_EMBED_INFO:
      return {
        ...state,
        embedInfo: action.payload,
        loading: false,
      };

    case GET_DASHBOARD_USERS:
      return {
        ...state,
        dashboardUsers: action.payload.users || action.payload,
        loading: false,
      };

    case ASSIGN_DASHBOARD_TO_USER:
      return {
        ...state,
        loading: false,
        message: action.payload.message || "Dashboard asignado exitosamente",
      };

    case REMOVE_DASHBOARD_FROM_USER:
      return {
        ...state,
        dashboardUsers: state.dashboardUsers.filter((user) => user.id !== action.payload.userId),
        loading: false,
        message: action.payload.message || "Dashboard removido del usuario exitosamente",
      };

    case EXPORT_DASHBOARD_CSV:
      return {
        ...state,
        loading: false,
        message: action.payload.message,
      };

    case SEND_DASHBOARD_EMAIL:
      return {
        ...state,
        loading: false,
        message: action.payload.message,
      };

    case GET_DASHBOARD_EMBEDDED_CONFIG:
      return {
        ...state,
        embeddedConfig: action.payload,
        loading: false,
      };

    case GET_REPORTS_LISTS:
      return {
        ...state,
        reportsList: action.payload,
        loading: false,
      };

    case GET_DASHBOARDS_INSTANCES:
      return {
        ...state,
        dashboardsInstancesList: action.payload,
        loading: false,
      };

    default:
      return state;
  }
};

export default dashboardsReducer;
