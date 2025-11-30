import { clearMessage, handleError, setLoading } from "../common/utils";
import { ERROR, LOADING, CLEAR_MESSAGE, CREATE, READ_ALL, UPDATE, DELETE, UPDATE_PASSWORD, GET_ROLES_LIST, GET_ACCOUNTS_LIST } from "./usersTypes";
import axios from "axios";

export const createUser = (user) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const res = await axios.post(`/users`, user);
    dispatch({ type: CREATE, payload: res.data });
    return true;
  } catch (error) {
    handleError(dispatch, ERROR, error);
    return false;
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

export const readUsers =
  (filters = {}) =>
  async (dispatch) => {
    setLoading(dispatch, true, LOADING);
    try {
      const res = await axios.get("/users", { params: filters });
      dispatch({ type: READ_ALL, payload: res.data });
      return true;
    } catch (error) {
      handleError(dispatch, ERROR, error);
      return false;
    } finally {
      setLoading(dispatch, false, LOADING);
      clearMessage(CLEAR_MESSAGE);
    }
  };

export const updateUser = (id, updateUserData) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const res = await axios.put(`/users/${id}`, updateUserData);
    dispatch({ type: UPDATE, payload: res.data });
    return true;
  } catch (error) {
    handleError(dispatch, ERROR, error);
    return false;
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

export const updateUserPasswordByUser =
  ({ currentPassword, newPassword }) =>
  async (dispatch) => {
    setLoading(dispatch, true, LOADING);

    try {
      const res = await axios.put(`/users/profile/password`, { currentPassword, newPassword });
      dispatch({ type: UPDATE_PASSWORD, payload: res.data });
    } catch (error) {
      handleError(dispatch, ERROR, error);
    } finally {
      setLoading(dispatch, false, LOADING);
      clearMessage(CLEAR_MESSAGE);
    }
  };

export const resetUserPasswordByAdmin = (userId, newPassword) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);

  try {
    const res = await axios.put(`/users/${userId}/password`, { newPassword });
    dispatch({ type: UPDATE_PASSWORD, payload: res.data });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

export const activateUser = (userId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);

  try {
    const res = await axios.post(`/users/${userId}/activate`);
    dispatch({ type: UPDATE, payload: res.data.user });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

export const deactivateUser = (userId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const res = await axios.post(`/users/${userId}/deactivate`);
    dispatch({ type: UPDATE, payload: res.data.user });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

export const deleteUser = (userId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    await axios.delete(`/users/${userId}`);
    dispatch({ type: DELETE, payload: { id: userId } });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

export const getAccountsLists = () => async (dispatch) => {
  try {
    const { data } = await axios.get(`/accounts`, { params: { mode: "select" } });
    dispatch({ type: GET_ACCOUNTS_LIST, payload: data });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

export const getRoleLists = () => async (dispatch) => {
  try {
    const { data } = await axios.get(`/roles`, { params: { mode: "select" } });
    dispatch({ type: GET_ROLES_LIST, payload: data });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};
