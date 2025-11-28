import { ERROR, LOADING, READ_PROFILE, SIGN_IN, CLEAR_MESSAGE, SIGN_OUT, TIME_AVAILABLE } from "./authTypes";
import axios from "axios";
import { config } from "../../util/state";

const extractErrorMessage = (error) => error?.response?.data?.message || error?.message || "Unexpected error";

const setLoading = (dispatch, value) => dispatch({ type: LOADING, payload: value });

const dispatchError = (dispatch, error, { invalidateSession = false } = {}) =>
  dispatch({
    type: ERROR,
    payload: {
      message: extractErrorMessage(error),
      invalidateSession,
    },
  });

export const clearMessage = () => (dispatch) => dispatch({ type: CLEAR_MESSAGE });

export const signIn = (credentials) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const res = await axios.post(`/auth/signIn`, credentials, {
      ...config,
      withCredentials: true,
    });
    dispatch({ type: SIGN_IN, payload: res.data });
  } catch (error) {
    dispatchError(dispatch, error, { invalidateSession: true });
  } finally {
    setLoading(dispatch, false);
  }
};

export const readProfile = () => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const res = await axios.get(`/auth/me`, { withCredentials: true });
    dispatch({ type: READ_PROFILE, payload: res.data });
  } catch (error) {
    dispatchError(dispatch, error, { invalidateSession: true });
  } finally {
    setLoading(dispatch, false);
  }
};

export const signOut = () => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    await axios.post(`/auth/signOut`, null, { withCredentials: true });
    dispatch({ type: SIGN_OUT });
  } catch (error) {
    dispatchError(dispatch, error);
  } finally {
    setLoading(dispatch, false);
  }
};

// Refresh current session TTL and update remaining time
export const refreshSession = () => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    await axios.post(`/auth/refresh`, null, { withCredentials: true });
    // After refreshing, read updated time left in session
    await dispatch(getTimeAvailable());
  } catch (error) {
    // If refresh fails, invalidate the session so the user is forced to sign in again
    dispatchError(dispatch, error, { invalidateSession: true });
    throw error;
  } finally {
    setLoading(dispatch, false);
  }
};

export const getTimeAvailable = () => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const res = await axios.get(`/auth/timeAvailable`, { withCredentials: true });
    dispatch({ type: TIME_AVAILABLE, payload: res.data });
  } catch (error) {
    dispatchError(dispatch, error, { invalidateSession: true });
  } finally {
    setLoading(dispatch, false);
  }
};
