import {
  ERROR,
  LOADING,
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
} from "./dashboardsTypes";
import axios from "axios";

const extractErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Unexpected error";

const setLoading = (dispatch, value) => dispatch({ type: LOADING, payload: value });

export const clearMessage = () => (dispatch) => dispatch({ type: CLEAR_MESSAGE });

// Get all dashboards with optional filters
export const getAllDashboards = (filters = {}) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.get(`/dashboards`, { params: filters });
    dispatch({
      type: GET_ALL_DASHBOARDS,
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

// Get dashboard by ID
export const getDashboardById = (dashboardId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.get(`/dashboards/${dashboardId}`);
    dispatch({
      type: GET_DASHBOARD_BY_ID,
      payload: data.dashboard,
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

// Create dashboard
export const createDashboard = (dashboardData) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.post(`/dashboards`, dashboardData);
    dispatch({
      type: CREATE_DASHBOARD,
      payload: data.dashboard,
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

// Update dashboard
export const updateDashboard = (dashboardData) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { id, ...updateData } = dashboardData;
    const { data } = await axios.put(`/dashboards/${id}`, updateData);
    dispatch({
      type: UPDATE_DASHBOARD,
      payload: data.dashboard,
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

// Delete dashboard (soft delete)
export const deleteDashboard = (dashboardId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.delete(`/dashboards/${dashboardId}`);
    dispatch({
      type: DELETE_DASHBOARD,
      payload: { dashboardId, message: data.message },
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

// Activate dashboard
export const activateDashboard = (dashboardId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.post(`/dashboards/${dashboardId}/activate`);
    dispatch({
      type: ACTIVATE_DASHBOARD,
      payload: data.dashboard,
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

// Deactivate dashboard
export const deactivateDashboard = (dashboardId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.post(`/dashboards/${dashboardId}/deactivate`);
    dispatch({
      type: ACTIVATE_DASHBOARD,
      payload: data.dashboard,
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

// Get dashboards by user
export const getDashboardsByUser = (userId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.get(`/dashboards/user/${userId}`);
    dispatch({
      type: GET_DASHBOARDS_BY_USER,
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

// Get dashboard embed info
export const getDashboardEmbedInfo = (dashboardId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.get(`/dashboards/${dashboardId}/embedInfo`);
    dispatch({
      type: GET_DASHBOARD_EMBED_INFO,
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

// Get users assigned to dashboard
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

// Assign dashboard to user
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

// Remove dashboard from user
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

// Export dashboard data to CSV
export const exportDashboardCsv = (dashboardId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.get(`/dashboards/${dashboardId}/exportCsv`, {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dashboard_${dashboardId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    dispatch({
      type: EXPORT_DASHBOARD_CSV,
      payload: { success: true, message: "CSV descargado exitosamente" },
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

// Send dashboard by email (PDF snapshot)
export const sendDashboardEmail = (dashboardId, emailData = {}) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.post(`/dashboards/${dashboardId}/sendEmail`, emailData);
    dispatch({
      type: SEND_DASHBOARD_EMAIL,
      payload: { success: true, message: data.message || "Email enviado exitosamente" },
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

// Get dashboard embedded config (guest token + config for embedding)
export const getDashboardEmbeddedConfig = (dashboardId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.get(`/dashboards/${dashboardId}/embeddedConfig`);
    dispatch({
      type: GET_DASHBOARD_EMBEDDED_CONFIG,
      payload: data,
    });
    return data; // Return for direct usage in component
  } catch (error) {
    dispatch({
      type: ERROR,
      payload: extractErrorMessage(error),
    });
    throw error; // Re-throw for component error handling
  } finally {
    setLoading(dispatch, false);
  }
};
