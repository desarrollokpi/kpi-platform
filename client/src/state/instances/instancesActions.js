import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  GET_ALL_INSTANCES,
  GET_INSTANCE_BY_ID,
  CREATE_INSTANCE,
  UPDATE_INSTANCE,
  DELETE_INSTANCE,
  ACTIVATE_INSTANCE,
  GET_INSTANCES_BY_ACCOUNT,
  ASSIGN_INSTANCE_TO_ACCOUNT,
  REMOVE_INSTANCE_FROM_ACCOUNT,
  SYNC_INSTANCE_WORKSPACES,
  GET_ACCOUNTS_LIST,
} from "./instancesTypes";
import axios from "axios";

const extractErrorMessage = (error) => error?.response?.data?.message || error?.message || "Unexpected error";

const setLoading = (dispatch, value) => dispatch({ type: LOADING, payload: value });

export const clearMessage = () => (dispatch) => dispatch({ type: CLEAR_MESSAGE });

// Get all instances with optional filters
export const getAllInstances =
  (filters = {}) =>
  async (dispatch) => {
    setLoading(dispatch, true);
    try {
      console.log("filters", filters);
      const { data } = await axios.get(`/instances`, { params: filters });
      dispatch({
        type: GET_ALL_INSTANCES,
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

// Get instance by ID
export const getInstanceById = (instanceId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.get(`/instances/${instanceId}`);
    dispatch({
      type: GET_INSTANCE_BY_ID,
      payload: data.intance,
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

// Create instance
export const createInstance = (instanceData) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.post(`/instances`, instanceData);
    dispatch({
      type: CREATE_INSTANCE,
      payload: data.intance,
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

// Update instance
export const updateInstance = (id, updateData) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.put(`/instances/${id}`, updateData);
    dispatch({
      type: UPDATE_INSTANCE,
      payload: data.intance,
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

// Delete instance (soft delete)
export const deleteInstance = (instanceId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.delete(`/instances/${instanceId}`);
    dispatch({
      type: DELETE_INSTANCE,
      payload: { instanceId, message: data.message },
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

// Activate instance
export const activateInstance = (instanceId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.post(`/instances/${instanceId}/activate`);
    dispatch({
      type: ACTIVATE_INSTANCE,
      payload: data.intance,
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

// Deactivate instance
export const deactivateInstance = (instanceId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.post(`/instances/${instanceId}/deactivate`);
    dispatch({
      type: ACTIVATE_INSTANCE,
      payload: data.intance,
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

// Get instances by account
export const getInstancesByAccount = (accountId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.get(`/instances/account/${accountId}`);
    dispatch({
      type: GET_INSTANCES_BY_ACCOUNT,
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

// Assign instance to account
export const assignInstanceToAccount = (accountId, instanceId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.post(`/accounts/${accountId}/assignInstance`, { intanceId: instanceId });
    dispatch({
      type: ASSIGN_INSTANCE_TO_ACCOUNT,
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

// Remove instance from account
export const removeInstanceFromAccount = (accountId, instanceId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.delete(`/accounts/${accountId}/removeInstance/${instanceId}`);
    dispatch({
      type: REMOVE_INSTANCE_FROM_ACCOUNT,
      payload: { accountId, instanceId, message: data.message },
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

// Sync instance workspaces from Superset
export const syncInstanceWorkspaces = (instanceId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.post(`/instances/${instanceId}/syncWorkspaces`);
    dispatch({
      type: SYNC_INSTANCE_WORKSPACES,
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
