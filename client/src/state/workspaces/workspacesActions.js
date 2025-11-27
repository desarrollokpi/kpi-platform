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

const extractErrorMessage = (error) => error?.response?.data?.message || error?.message || "Unexpected error";

const setLoading = (dispatch, value) => dispatch({ type: LOADING, payload: value });

export const handleError = (dispatch, error) => {
  dispatch({ type: ERROR, payload: error.response.data });
  setTimeout(() => {
    dispatch({ type: CLEAR_MESSAGE, payload: error.response.data.message });
  }, 3000);
};

export const clearWorkspaces = () => (dispatch) => {
  return dispatch({ type: CLEAR_WORKSPACES });
};

export const readWorkspacesByAdmin = () => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const res = await axios.get("/workspaces");
    dispatch({ type: READ_WORKSPACES_BY_ADMIN, payload: res.data });
  } catch (error) {
    handleError(dispatch, error);
  } finally {
    setLoading(dispatch, false);
  }
};

export const readWorkspacesByUser = () => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const res = await axios.get("/workspaces/users");
    dispatch({ type: READ_WORKSPACES_BY_USER, payload: res.data });
  } catch (error) {
    handleError(dispatch, error);
  } finally {
    setLoading(dispatch, false);
  }
};

// Get all workspaces with filters
export const getAllWorkspaces =
  (filters = {}) =>
  async (dispatch) => {
    setLoading(dispatch, true);
    try {
      const { data } = await axios.get("/workspaces", { params: filters });
      dispatch({
        type: GET_ALL_WORKSPACES,
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

// Get workspace by ID
export const getWorkspaceById = (workspaceId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.get(`/workspaces/${workspaceId}`);
    dispatch({
      type: GET_WORKSPACE_BY_ID,
      payload: data.workspace,
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

// Create workspace
export const createWorkspace = (workspaceData) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.post("/workspaces", workspaceData);
    dispatch({
      type: CREATE_WORKSPACE,
      payload: data.workspace,
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

// Update workspace
export const updateWorkspace = (workspaceData) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { id, ...updateData } = workspaceData;
    const { data } = await axios.put(`/workspaces/${id}`, updateData);
    dispatch({
      type: UPDATE_WORKSPACE,
      payload: data.workspace,
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

// Delete workspace (soft delete)
export const deleteWorkspace = (workspaceId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.delete(`/workspaces/${workspaceId}`);
    dispatch({
      type: DELETE_WORKSPACE,
      payload: { workspaceId, message: data.message },
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

// Activate workspace
export const activateWorkspace = (workspaceId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.post(`/workspaces/${workspaceId}/activate`);
    dispatch({
      type: ACTIVATE_WORKSPACE,
      payload: data.workspace,
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

// Deactivate workspace
export const deactivateWorkspace = (workspaceId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.post(`/workspaces/${workspaceId}/deactivate`);
    dispatch({
      type: ACTIVATE_WORKSPACE,
      payload: data.workspace,
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

export const getInstancesLists = (accountId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.get(`/instances`, { params: { listed: true, accountId } });
    dispatch({
      type: GET_INSTANCES_LIST,
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

export const getAccountsLists = () => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.get(`/accounts`, { params: { listed: true } });
    dispatch({
      type: GET_ACCOUNTS_LIST,
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
