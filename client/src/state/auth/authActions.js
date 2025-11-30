import axios from "axios";
import { setLoading, clearMessage, extractErrorMessage } from "../common/utils";
import { ERROR, LOADING, READ_PROFILE, SIGN_IN, CLEAR_MESSAGE, SIGN_OUT } from "./authTypes";

const dispatchError = (dispatch, error, { invalidateSession } = {}) => {
  const status = error?.response?.status;
  const shouldInvalidate = typeof invalidateSession === "boolean" ? invalidateSession : status === 409;

  return dispatch({
    type: ERROR,
    payload: {
      message: extractErrorMessage(error),
      invalidateSession: shouldInvalidate,
    },
  });
};

export const signIn = (credentials) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const res = await axios.post(`/auth/signIn`, credentials, {
      withCredentials: true,
    });
    dispatch({ type: SIGN_IN, payload: res.data });
  } catch (error) {
    dispatchError(dispatch, error, { invalidateSession: true });
  } finally {
    setLoading(dispatch, false, LOADING);
    dispatch(clearMessage(CLEAR_MESSAGE));
  }
};

export const readProfile = () => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const res = await axios.get(`/auth/me`, { withCredentials: true });
    dispatch({ type: READ_PROFILE, payload: res.data });
  } catch (error) {
    dispatchError(dispatch, error, { invalidateSession: true });
  } finally {
    setLoading(dispatch, false, LOADING);
    dispatch(clearMessage(CLEAR_MESSAGE));
  }
};

export const signOut = () => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    await axios.post(`/auth/signOut`, null, { withCredentials: true });
    dispatch({ type: SIGN_OUT });
  } catch (error) {
    dispatchError(dispatch, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    dispatch(clearMessage(CLEAR_MESSAGE));
  }
};

export const refreshSession = () => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    await axios.post(`/auth/refresh`, null, { withCredentials: true });
  } catch (error) {
    dispatchError(dispatch, error, { invalidateSession: true });
    throw error;
  } finally {
    setLoading(dispatch, false, LOADING);
    dispatch(clearMessage(CLEAR_MESSAGE));
  }
};
