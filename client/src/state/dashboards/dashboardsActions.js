import { clearMessage, handleError, setLoading } from "../common/utils";
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
  GET_REPORTS_LISTS,
  GET_DASHBOARDS_INSTANCES,
} from "./dashboardsTypes";
import axios from "axios";

// Get all dashboards with optional filters
export const getAllDashboards =
  (filters = {}) =>
  async (dispatch) => {
    setLoading(dispatch, true, LOADING);
    try {
      const { data } = await axios.get(`/dashboards`, { params: filters });
      dispatch({
        type: GET_ALL_DASHBOARDS,
        payload: data,
      });
    } catch (error) {
      handleError(dispatch, ERROR, error);
    } finally {
      setLoading(dispatch, false, LOADING);
      clearMessage(CLEAR_MESSAGE);
    }
  };

// Get dashboard by ID
export const getDashboardById = (dashboardId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.get(`/dashboards/${dashboardId}`);
    dispatch({
      type: GET_DASHBOARD_BY_ID,
      payload: data.dashboard,
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

// Create dashboard
export const createDashboard = (dashboardData) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.post(`/dashboards`, dashboardData);
    dispatch({
      type: CREATE_DASHBOARD,
      payload: data.dashboard,
    });
    return true;
  } catch (error) {
    handleError(dispatch, ERROR, error);
    return false;
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

// Update dashboard
export const updateDashboard = (id, dashboardData) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.put(`/dashboards/${id}`, dashboardData);
    dispatch({
      type: UPDATE_DASHBOARD,
      payload: data.dashboard,
    });
    return true;
  } catch (error) {
    handleError(dispatch, ERROR, error);
    return false;
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

// Delete dashboard (soft delete)
export const deleteDashboard = (dashboardId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.delete(`/dashboards/${dashboardId}`);
    dispatch({
      type: DELETE_DASHBOARD,
      payload: { dashboardId, message: data.message },
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

// Activate dashboard
export const activateDashboard = (dashboardId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.post(`/dashboards/${dashboardId}/activate`);
    dispatch({
      type: ACTIVATE_DASHBOARD,
      payload: data.dashboard,
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

// Deactivate dashboard
export const deactivateDashboard = (dashboardId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.post(`/dashboards/${dashboardId}/deactivate`);
    dispatch({
      type: ACTIVATE_DASHBOARD,
      payload: data.dashboard,
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

// Get dashboards by user
export const getDashboardsByUser = (userId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.get(`/dashboards/user/${userId}`);
    dispatch({
      type: GET_DASHBOARDS_BY_USER,
      payload: data,
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

export const getDashboardsAssignableForUser = (userId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.get(`/dashboards/assignableForUser/${userId}`);
    dispatch({
      type: GET_ALL_DASHBOARDS,
      payload: data,
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

// Get dashboard embed info
export const getDashboardEmbedInfo = (dashboardId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.get(`/dashboards/${dashboardId}/embedInfo`);
    dispatch({
      type: GET_DASHBOARD_EMBED_INFO,
      payload: data,
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

// Get users assigned to dashboard
export const getDashboardUsers = (dashboardId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.get(`/dashboards/${dashboardId}/users`);
    dispatch({
      type: GET_DASHBOARD_USERS,
      payload: data,
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

// Assign dashboard to user
export const assignDashboardToUser = (dashboardId, userId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.post(`/dashboards/${dashboardId}/assignUser`, { userId });
    dispatch({
      type: ASSIGN_DASHBOARD_TO_USER,
      payload: data,
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

// Remove dashboard from user
export const removeDashboardFromUser = (dashboardId, userId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.delete(`/dashboards/${dashboardId}/removeUser/${userId}`);
    dispatch({
      type: REMOVE_DASHBOARD_FROM_USER,
      payload: { dashboardId, userId, message: data.message },
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

// Export dashboard data to CSV
export const exportDashboardCsv = (dashboardId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.get(`/dashboards/${dashboardId}/exportCsv`);

    const files = Array.isArray(data?.files) ? data.files : [];

    files.forEach((file, index) => {
      const csvContent = file.csv || "";
      const filename = file.filename || `dashboard_${dashboardId}_dataset_${file.datasetId ?? index}_${Date.now()}.csv`;

      const blob = new Blob([csvContent], { type: file.contentType || "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    });

    dispatch({
      type: EXPORT_DASHBOARD_CSV,
      payload: { success: true, message: "CSV descargado exitosamente" },
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

// Send dashboard by email (PDF snapshot)
export const sendDashboardEmail =
  (dashboardId, emailData = {}) =>
  async (dispatch) => {
    setLoading(dispatch, true, LOADING);
    try {
      const { data } = await axios.post(`/dashboards/${dashboardId}/sendEmail`, emailData);
      dispatch({
        type: SEND_DASHBOARD_EMAIL,
        payload: { success: true, message: data.message || "Email enviado exitosamente" },
      });
    } catch (error) {
      handleError(dispatch, ERROR, error);
    } finally {
      setLoading(dispatch, false, LOADING);
      clearMessage(CLEAR_MESSAGE);
    }
  };

// Get dashboard embedded config (guest token + config for embedding)
export const getDashboardEmbeddedConfig = (dashboardId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.get(`/dashboards/${dashboardId}/embeddedConfig`);
    dispatch({
      type: GET_DASHBOARD_EMBEDDED_CONFIG,
      payload: data,
    });
    return data;
  } catch (error) {
    handleError(dispatch, ERROR, error);

    throw error; // Re-throw for component error handling
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

export const getReportsLists =
  ({ accountId }) =>
  async (dispatch) => {
    setLoading(dispatch, true, LOADING);
    try {
      const { data } = await axios.get(`/reports`, { params: { mode: "select", accountId } });
      dispatch({
        type: GET_REPORTS_LISTS,
        payload: data,
      });
    } catch (error) {
      handleError(dispatch, ERROR, error);

      throw error; // Re-throw for component error handling
    } finally {
      setLoading(dispatch, false, LOADING);
      clearMessage(CLEAR_MESSAGE);
    }
  };

export const getDashboardsInstancesLists =
  ({ reportId }) =>
  async (dispatch) => {
    setLoading(dispatch, true, LOADING);

    try {
      const { data } = await axios.get(`/dashboards/instancesForSelect`, { params: { reportId } });
      dispatch({
        type: GET_DASHBOARDS_INSTANCES,
        payload: data,
      });
    } catch (error) {
      handleError(dispatch, ERROR, error);

      throw error; // Re-throw for component error handling
    } finally {
      setLoading(dispatch, false, LOADING);
      clearMessage(CLEAR_MESSAGE);
    }
  };
