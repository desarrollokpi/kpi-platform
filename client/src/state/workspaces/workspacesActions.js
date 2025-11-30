import { clearMessage, handleError, setLoading } from "../common/utils";
import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  READ_WORKSPACES_BY_ADMIN,
  READ_WORKSPACES_BY_USER,
  CLEAR_WORKSPACES,
  GET_ALL_WORKSPACES,
  GET_WORKSPACE_BY_ID,
  CREATE_WORKSPACE,
  UPDATE_WORKSPACE,
  DELETE_WORKSPACE,
  ACTIVATE_WORKSPACE,
  GET_INSTANCES_LIST,
  GET_ACCOUNTS_LIST,
} from "./workspacesTypes";

import axios from "axios";

export const clearWorkspaces = () => (dispatch) => {
  return dispatch({ type: CLEAR_WORKSPACES });
};

export const readWorkspacesByAdmin = () => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const res = await axios.get("/workspaces");
    dispatch({ type: READ_WORKSPACES_BY_ADMIN, payload: res.data });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

export const readWorkspacesByUser = () => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const res = await axios.get("/workspaces/users");
    dispatch({ type: READ_WORKSPACES_BY_USER, payload: res.data });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

// Get all workspaces with filters
export const getAllWorkspaces =
  (filters = {}) =>
  async (dispatch) => {
    setLoading(dispatch, true, LOADING);
    try {
      const { data } = await axios.get("/workspaces", { params: filters });
      dispatch({
        type: GET_ALL_WORKSPACES,
        payload: data,
      });
    } catch (error) {
      handleError(dispatch, ERROR, error);
    } finally {
      setLoading(dispatch, false, LOADING);
      clearMessage(CLEAR_MESSAGE);
    }
  };

// Get workspace by ID
export const getWorkspaceById = (workspaceId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.get(`/workspaces/${workspaceId}`);
    dispatch({
      type: GET_WORKSPACE_BY_ID,
      payload: data.workspace,
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

// Create workspace
export const createWorkspace = (workspaceData) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.post("/workspaces", workspaceData);
    dispatch({
      type: CREATE_WORKSPACE,
      payload: data.workspace,
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

// Update workspace
export const updateWorkspace = (id, workspaceData) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.put(`/workspaces/${id}`, workspaceData);
    dispatch({
      type: UPDATE_WORKSPACE,
      payload: data.workspace,
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

// Delete workspace (soft delete)
export const deleteWorkspace = (workspaceId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.delete(`/workspaces/${workspaceId}`);
    dispatch({
      type: DELETE_WORKSPACE,
      payload: { workspaceId, message: data.message },
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

// Activate workspace
export const activateWorkspace = (workspaceId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.post(`/workspaces/${workspaceId}/activate`);
    dispatch({
      type: ACTIVATE_WORKSPACE,
      payload: data.workspace,
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

// Deactivate workspace
export const deactivateWorkspace = (workspaceId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.post(`/workspaces/${workspaceId}/deactivate`);
    dispatch({
      type: ACTIVATE_WORKSPACE,
      payload: data.workspace,
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

export const getInstancesLists = (accountId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.get(`/instances`, { params: { mode: "select", accountId } });
    dispatch({
      type: GET_INSTANCES_LIST,
      payload: data,
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

export const getAccountsLists = () => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.get(`/accounts`, { params: { mode: "select" } });
    dispatch({
      type: GET_ACCOUNTS_LIST,
      payload: data,
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};
