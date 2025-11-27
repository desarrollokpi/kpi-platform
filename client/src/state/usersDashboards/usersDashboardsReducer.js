import {
  LOADING,
  ERROR,
  CLEAR_MESSAGE,
  GET_USER_DASHBOARDS,
  GET_DASHBOARD_USERS,
  ASSIGN_DASHBOARD_TO_USER,
  REMOVE_DASHBOARD_FROM_USER,
  BULK_ASSIGN_DASHBOARDS,
} from "./usersDashboardsTypes";

const initialState = {
  loading: false,
  message: null,
  userDashboards: [],
  dashboardUsers: [],
};

const usersDashboardsReducer = (state = initialState, action) => {
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

    case GET_USER_DASHBOARDS:
      return {
        ...state,
        userDashboards: action.payload.dashboards || action.payload,
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
        dashboardUsers: state.dashboardUsers.filter(
          (user) => user.id !== action.payload.userId
        ),
        loading: false,
        message: action.payload.message || "Dashboard removido del usuario exitosamente",
      };

    case BULK_ASSIGN_DASHBOARDS:
      return {
        ...state,
        loading: false,
        message: action.payload.message || "Dashboards asignados exitosamente",
      };

    default:
      return state;
  }
};

export default usersDashboardsReducer;
