import { clearMessage, handleError, setLoading } from "../common/utils";
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

// Get all instances with optional filters
export const getAllInstances =
  (filters = {}) =>
  async (dispatch) => {
    setLoading(dispatch, true, LOADING);
    try {
      const { data } = await axios.get(`/instances`, { params: filters });
      dispatch({
        type: GET_ALL_INSTANCES,
        payload: data,
      });
    } catch (error) {
      handleError(dispatch, ERROR, error);
    } finally {
      setLoading(dispatch, false, LOADING);
      clearMessage(CLEAR_MESSAGE);
    }
  };

// Get instance by ID
export const getInstanceById = (instanceId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.get(`/instances/${instanceId}`);
    dispatch({
      type: GET_INSTANCE_BY_ID,
      payload: data.intance,
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

// Create instance
export const createInstance = (instanceData) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.post(`/instances`, instanceData);
    dispatch({
      type: CREATE_INSTANCE,
      payload: data.intance,
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

// Update instance
export const updateInstance = (id, updateData) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.put(`/instances/${id}`, updateData);
    dispatch({
      type: UPDATE_INSTANCE,
      payload: data.intance,
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

// Delete instance (soft delete)
export const deleteInstance = (instanceId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.delete(`/instances/${instanceId}`);
    dispatch({
      type: DELETE_INSTANCE,
      payload: { instanceId, message: data.message },
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

// Activate instance
export const activateInstance = (instanceId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.post(`/instances/${instanceId}/activate`);
    dispatch({
      type: ACTIVATE_INSTANCE,
      payload: data.intance,
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

// Deactivate instance
export const deactivateInstance = (instanceId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.post(`/instances/${instanceId}/deactivate`);
    dispatch({
      type: ACTIVATE_INSTANCE,
      payload: data.intance,
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

// Get instances by account
export const getInstancesByAccount = (accountId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.get(`/instances/account/${accountId}`);
    dispatch({
      type: GET_INSTANCES_BY_ACCOUNT,
      payload: data,
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

// Assign instance to account
export const assignInstanceToAccount = (accountId, instanceId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.post(`/accounts/${accountId}/assignInstance`, { intanceId: instanceId });
    dispatch({
      type: ASSIGN_INSTANCE_TO_ACCOUNT,
      payload: data,
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

// Remove instance from account
export const removeInstanceFromAccount = (accountId, instanceId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.delete(`/accounts/${accountId}/removeInstance/${instanceId}`);
    dispatch({
      type: REMOVE_INSTANCE_FROM_ACCOUNT,
      payload: { accountId, instanceId, message: data.message },
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

// Sync instance workspaces from Superset
export const syncInstanceWorkspaces = (instanceId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.post(`/instances/${instanceId}/syncWorkspaces`);
    dispatch({
      type: SYNC_INSTANCE_WORKSPACES,
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
