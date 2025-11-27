import { ERROR, LOADING, CLEAR_MESSAGE, CREATE, READ_ALL, UPDATE, UPDATE_PASSWORD, GET_ROLES_LIST, GET_ACCOUNTS_LIST } from "./usersTypes";

import axios from "axios";

import { config } from "../../util/state";

const setLoading = (dispatch, value) => dispatch({ type: LOADING, payload: value });

export const handleError = (dispatch, error) => {
  dispatch({ type: ERROR, payload: error.response.data });
  setTimeout(() => {
    dispatch({ type: CLEAR_MESSAGE, payload: error.response.data.message });
  }, 3000);
};

export const createUser = (user) => async (dispatch) => {
  setLoading(dispatch, true);

  try {
    const res = await axios.post(`/users`, user, config);
    dispatch({ type: CREATE, payload: res.data });
  } catch (error) {
    handleError(dispatch, error);
  } finally {
    setLoading(dispatch, false);
  }
};

export const readUsers =
  (filters = {}) =>
  async (dispatch) => {
    setLoading(dispatch, true);

    try {
      const res = await axios.get("/users", { params: filters });
      dispatch({ type: READ_ALL, payload: res.data });
    } catch (error) {
      handleError(dispatch, error);
    } finally {
      setLoading(dispatch, false);
    }
  };

export const updateUser = (user) => async (dispatch) => {
  setLoading(dispatch, true);

  try {
    const res = await axios.put(`/users/${user.id}`, user, config);
    dispatch({ type: UPDATE, payload: res.data });
  } catch (error) {
    handleError(dispatch, error);
  } finally {
    setLoading(dispatch, false);
  }
};

export const updateUserPasswordByUser = (password) => async (dispatch) => {
  setLoading(dispatch, true);

  try {
    const res = await axios.put(`/users/changePassword`, { password }, config);
    dispatch({ type: UPDATE_PASSWORD, payload: res.data });
  } catch (error) {
    handleError(dispatch, error);
  } finally {
    setLoading(dispatch, false);
  }
};

export const activateUser = (userId) => async (dispatch) => {
  setLoading(dispatch, true);

  try {
    const res = await axios.post(`/users/${userId}/activate`);
    dispatch({ type: UPDATE, payload: res.data.user });
  } catch (error) {
    handleError(dispatch, error);
  } finally {
    setLoading(dispatch, false);
  }
};

export const deactivateUser = (userId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const res = await axios.post(`/users/${userId}/deactivate`);
    dispatch({ type: UPDATE, payload: res.data.user });
  } catch (error) {
    handleError(dispatch, error);
  } finally {
    setLoading(dispatch, false);
  }
};

export const getAccountsLists = () => async (dispatch) => {
  try {
    const { data } = await axios.get(`/accounts`, { params: { listed: true } });
    dispatch({ type: GET_ACCOUNTS_LIST, payload: data });
  } catch (error) {
    handleError(dispatch, error);
  } finally {
    setLoading(dispatch, false);
  }
};

export const getRoleLists = () => async (dispatch) => {
  try {
    const { data } = await axios.get(`/roles/select`);
    dispatch({ type: GET_ROLES_LIST, payload: data });
  } catch (error) {
    handleError(dispatch, error);
  } finally {
    setLoading(dispatch, false);
  }
};
