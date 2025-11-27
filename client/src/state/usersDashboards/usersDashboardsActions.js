import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  GET_USER_DASHBOARDS,
  GET_DASHBOARD_USERS,
  ASSIGN_DASHBOARD_TO_USER,
  REMOVE_DASHBOARD_FROM_USER,
  BULK_ASSIGN_DASHBOARDS,
} from "./usersDashboardsTypes";
import axios from "axios";

const extractErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Unexpected error";

const setLoading = (dispatch, value) => dispatch({ type: LOADING, payload: value });

export const clearMessage = () => (dispatch) => dispatch({ type: CLEAR_MESSAGE });

// Get dashboards assigned to a specific user
export const getUserDashboards = (userId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.get(`/dashboards/user/${userId}`);
    dispatch({
      type: GET_USER_DASHBOARDS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: ERROR,
      payload: extractErrorMessage(error),
    });
  } finally {
    setLoading(dispatch, false);
  }
};

// Get users assigned to a specific dashboard
export const getDashboardUsers = (dashboardId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.get(`/dashboards/${dashboardId}/users`);
    dispatch({
      type: GET_DASHBOARD_USERS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: ERROR,
      payload: extractErrorMessage(error),
    });
  } finally {
    setLoading(dispatch, false);
  }
};

// Assign a dashboard to a user
export const assignDashboardToUser = (dashboardId, userId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.post(`/dashboards/${dashboardId}/assignUser`, { userId });
    dispatch({
      type: ASSIGN_DASHBOARD_TO_USER,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: ERROR,
      payload: extractErrorMessage(error),
    });
  } finally {
    setLoading(dispatch, false);
  }
};

// Remove a dashboard from a user
export const removeDashboardFromUser = (dashboardId, userId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.delete(`/dashboards/${dashboardId}/removeUser/${userId}`);
    dispatch({
      type: REMOVE_DASHBOARD_FROM_USER,
      payload: { dashboardId, userId, message: data.message },
    });
  } catch (error) {
    dispatch({
      type: ERROR,
      payload: extractErrorMessage(error),
    });
  } finally {
    setLoading(dispatch, false);
  }
};

// Bulk assign multiple dashboards to a user
export const bulkAssignDashboards = (userId, dashboardIds) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.post(`/users/${userId}/assignDashboards`, { dashboardIds });
    dispatch({
      type: BULK_ASSIGN_DASHBOARDS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: ERROR,
      payload: extractErrorMessage(error),
    });
  } finally {
    setLoading(dispatch, false);
  }
};
