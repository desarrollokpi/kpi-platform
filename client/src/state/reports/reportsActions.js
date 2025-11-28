import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  CREATE_REPORTS_GROUP,
  READ_REPORT_GROUPS_BY_ADMIN,
  READ_REPORTS_BY_ADMIN,
  READ_REPORTS_BY_USER,
  READ_ACCOUNT_REPORTS_BY_ADMIN,
  UPDATE_REPORT_ACTIVE_STATE_BY_ADMIN,
  UPDATE_REPORTS_GROUP,
  CLEAR_REPORTS,
  CREATE_REPORT,
  UPDATE_REPORT,
  GET_REPORT_BY_ID,
  DELETE_REPORT,
  GET_WORKSPACES_LIST,
} from "./reportsTypes";

import axios from "axios";

import { config } from "../../util/state";

const setLoading = (dispatch, value) => dispatch({ type: LOADING, payload: value });

export const handleError = (dispatch, error) => {
  dispatch({ type: ERROR, payload: error.response.data });
  setTimeout(() => {
    dispatch({
      type: CLEAR_MESSAGE,
      payload: error.response.data.message,
    });
  }, 3000);
};

export const clearReports = () => (dispatch) => {
  return dispatch({ type: CLEAR_REPORTS });
};

export const readReportGroupsByAdmin = () => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const res = await axios.get("/reports/groups");
    dispatch({
      type: READ_REPORT_GROUPS_BY_ADMIN,
      payload: res.data,
    });
  } catch (error) {
    handleError(dispatch, error);
  } finally {
    setLoading(dispatch, false);
  }
};

export const readReportsByAdmin = (filters = {}) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const res = await axios.get("/reports", { params: filters });
    dispatch({
      type: READ_REPORTS_BY_ADMIN,
      payload: res.data,
    });
  } catch (error) {
    handleError(dispatch, error);
  } finally {
    setLoading(dispatch, false);
  }
};

export const readReportsByUser = () => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const res = await axios.get("/reports/users");
    dispatch({
      type: READ_REPORTS_BY_USER,
      payload: res.data,
    });
  } catch (error) {
    handleError(dispatch, error);
  } finally {
    setLoading(dispatch, false);
  }
};

export const readAccountReportsByAdmin = () => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const res = await axios.get("/reports/account");
    dispatch({
      type: READ_ACCOUNT_REPORTS_BY_ADMIN,
      payload: res.data,
    });
  } catch (error) {
    handleError(dispatch, error);
  } finally {
    setLoading(dispatch, false);
  }
};

// deprecated
// export const readUsersReportsByAdmin = () => async dispatch => {
//   setLoading()(dispatch)
//   try {
//     const res = await axios.get('/reports/users')
//     dispatch({
//       type: READ_USERS_REPORTS_BY_ADMIN,
//       payload: res.data,
//     })
//   } catch (error) {
//     handleError(dispatch, error)
//   }
// }

export const updateReportActiveStateByAdmin = (active, reportId, workspaceId) => async (dispatch) => {
  setLoading(dispatch, true);

  try {
    const res = await axios.put(`/reports/toggleActive/${reportId}`, { active, workspaceId }, config);
    dispatch({ type: UPDATE_REPORT_ACTIVE_STATE_BY_ADMIN, payload: res.data });
  } catch (error) {
    dispatch({ type: ERROR, payload: error.response.data.message });
  } finally {
    setLoading(dispatch, false);
  }
};

export const updateReportsGroup = (reportsGroup) => async (dispatch) => {
  setLoading(dispatch, true);

  try {
    const res = await axios.put(`/reports/groups/${reportsGroup.id}`, reportsGroup, config);
    dispatch({ type: UPDATE_REPORTS_GROUP, payload: res.data });
  } catch (error) {
    dispatch({ type: ERROR, payload: error.response.data.message });
  } finally {
    setLoading(dispatch, false);
  }
};

export const createReportsGroup = (reportsGroup) => async (dispatch) => {
  setLoading(dispatch, true);

  try {
    const res = await axios.post(`/reports/groups/`, reportsGroup, config);
    dispatch({ type: CREATE_REPORTS_GROUP, payload: res.data });
  } catch (error) {
    dispatch({ type: ERROR, payload: error.response.data.message });
  } finally {
    setLoading(dispatch, false);
  }
};

// Activate report
export const activateReport = (reportId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const res = await axios.post(`/reports/${reportId}/activate`);
    dispatch({ type: READ_REPORTS_BY_ADMIN, payload: res.data });
  } catch (error) {
    handleError(dispatch, error);
  } finally {
    setLoading(dispatch, false);
  }
};

// Deactivate report
export const deactivateReport = (reportId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const res = await axios.post(`/reports/${reportId}/deactivate`);
    dispatch({ type: READ_REPORTS_BY_ADMIN, payload: res.data });
  } catch (error) {
    handleError(dispatch, error);
  } finally {
    setLoading(dispatch, false);
  }
};

const extractErrorMessage = (error) => error?.response?.data?.message || error?.message || "Error inesperado";

// Get report by ID
export const getReportById = (reportId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.get(`/reports/${reportId}`);
    dispatch({
      type: GET_REPORT_BY_ID,
      payload: data.report || data,
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

// Create report
export const createReport = (reportData) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.post("/reports", reportData);
    dispatch({
      type: CREATE_REPORT,
      payload: data.report || data,
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

// Update report
export const updateReport = (reportData) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { id, ...updateData } = reportData;
    const { data } = await axios.put(`/reports/${id}`, updateData);
    dispatch({
      type: UPDATE_REPORT,
      payload: data.report || data,
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

// Delete report (soft delete)
export const deleteReport = (reportId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.delete(`/reports/${reportId}`);
    dispatch({
      type: DELETE_REPORT,
      payload: { reportId, message: data.message },
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

// Get workspaces list for reports (filtered by accountId)
export const getWorkspacesListForReports = (filters = {}) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.get("/workspaces", { params: filters });
    dispatch({
      type: GET_WORKSPACES_LIST,
      payload: data.workspaces || data,
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
