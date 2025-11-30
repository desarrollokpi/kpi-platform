import { clearMessage, handleError, setLoading } from "../common/utils";
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

export const clearReports = () => (dispatch) => {
  return dispatch({ type: CLEAR_REPORTS });
};

export const readReportGroupsByAdmin = () => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const res = await axios.get("/reports/groups");
    dispatch({
      type: READ_REPORT_GROUPS_BY_ADMIN,
      payload: res.data,
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

export const readReportsByAdmin =
  (filters = {}) =>
  async (dispatch) => {
    setLoading(dispatch, true, LOADING);
    try {
      const res = await axios.get("/reports", { params: filters });
      dispatch({
        type: READ_REPORTS_BY_ADMIN,
        payload: res.data,
      });
    } catch (error) {
      handleError(dispatch, ERROR, error);
    } finally {
      setLoading(dispatch, false, LOADING);
      clearMessage(CLEAR_MESSAGE);
    }
  };

export const readReportsByUser = () => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const res = await axios.get("/reports/users");
    dispatch({
      type: READ_REPORTS_BY_USER,
      payload: res.data,
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

export const readAccountReportsByAdmin = () => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const res = await axios.get("/reports/account");
    dispatch({
      type: READ_ACCOUNT_REPORTS_BY_ADMIN,
      payload: res.data,
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

export const updateReportActiveStateByAdmin = (active, reportId, workspaceId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);

  try {
    const res = await axios.put(`/reports/toggleActive/${reportId}`, { active, workspaceId });
    dispatch({ type: UPDATE_REPORT_ACTIVE_STATE_BY_ADMIN, payload: res.data });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

export const updateReportsGroup = (reportsGroup) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);

  try {
    const res = await axios.put(`/reports/groups/${reportsGroup.id}`, reportsGroup);
    dispatch({ type: UPDATE_REPORTS_GROUP, payload: res.data });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

export const createReportsGroup = (reportsGroup) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);

  try {
    const res = await axios.post(`/reports/groups/`, reportsGroup);
    dispatch({ type: CREATE_REPORTS_GROUP, payload: res.data });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

// Activate report
export const activateReport = (reportId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.post(`/reports/${reportId}/activate`);
    dispatch({
      type: UPDATE_REPORT,
      payload: data.report || data,
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

// Deactivate report
export const deactivateReport = (reportId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.post(`/reports/${reportId}/deactivate`);
    dispatch({
      type: UPDATE_REPORT,
      payload: data.report || data,
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

// Get report by ID
export const getReportById = (reportId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.get(`/reports/${reportId}`);
    dispatch({
      type: GET_REPORT_BY_ID,
      payload: data.report || data,
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

// Create report
export const createReport = (reportData) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.post("/reports", reportData);
    dispatch({
      type: CREATE_REPORT,
      payload: data.report || data,
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

// Update report
export const updateReport = (id, reportData) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.put(`/reports/${id}`, reportData);
    dispatch({
      type: UPDATE_REPORT,
      payload: data.report || data,
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

// Delete report (soft delete)
export const deleteReport = (reportId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.delete(`/reports/${reportId}`);
    dispatch({
      type: DELETE_REPORT,
      payload: { reportId, message: data.message },
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

// Get workspaces list for reports (filtered by accountId)
export const getWorkspacesListForReports =
  (filters = {}) =>
  async (dispatch) => {
    setLoading(dispatch, true, LOADING);
    try {
      const { data } = await axios.get("/workspaces", { params: filters });
      dispatch({
        type: GET_WORKSPACES_LIST,
        payload: data.workspaces || data,
      });
    } catch (error) {
      handleError(dispatch, ERROR, error);
    } finally {
      setLoading(dispatch, false, LOADING);
      clearMessage(CLEAR_MESSAGE);
    }
  };
