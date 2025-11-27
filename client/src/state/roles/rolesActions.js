import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  GET_ALL_ROLES,
  GET_ROLE_BY_ID,
  GET_USER_ROLES,
  ASSIGN_ROLE_TO_USER,
  REMOVE_ROLE_FROM_USER,
} from "./rolesTypes";
import axios from "axios";

const extractErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Unexpected error";

const setLoading = (dispatch, value) => dispatch({ type: LOADING, payload: value });

export const clearMessage = () => (dispatch) => dispatch({ type: CLEAR_MESSAGE });

// Get all roles
export const getAllRoles = () => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.get(`/roles`);
    dispatch({
      type: GET_ALL_ROLES,
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

// Get role by ID
export const getRoleById = (roleId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.get(`/roles/${roleId}`);
    dispatch({
      type: GET_ROLE_BY_ID,
      payload: data.role,
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

// Get roles for a specific user
export const getUserRoles = (userId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.get(`/users/${userId}/roles`);
    dispatch({
      type: GET_USER_ROLES,
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

// Assign role to user
export const assignRoleToUser = (userId, roleId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.post(`/users/${userId}/assignRole`, { roleId });
    dispatch({
      type: ASSIGN_ROLE_TO_USER,
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

// Remove role from user
export const removeRoleFromUser = (userId, roleId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.delete(`/users/${userId}/removeRole/${roleId}`);
    dispatch({
      type: REMOVE_ROLE_FROM_USER,
      payload: { userId, roleId, message: data.message },
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
