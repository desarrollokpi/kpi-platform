import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  READ_LOGO_BY_SUBDOMAIN,
  GET_ALL_ACCOUNTS,
  CREATE_ACCOUNT,
  UPDATE_ACCOUNT,
  GET_ACCOUNT_BY_ID
} from "./accountsTypes";
import axios from "axios";

const extractErrorMessage = (error) => error?.response?.data?.message || error?.message || "Unexpected error";

const setLoading = (dispatch, value) => dispatch({ type: LOADING, payload: value });

export const clearMessage = () => (dispatch) => dispatch({ type: CLEAR_MESSAGE });

export const readLogoBySubdomain = (subdomain) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.get(`/accounts/logoBySubdomain`, { params: { subdomain } });
    dispatch({
      type: READ_LOGO_BY_SUBDOMAIN,
      payload: data || null,
      meta: { subdomain },
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

export const getAccountsLists = (options) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.get(`/accounts`, { params: { ...options } });
    dispatch({
      type: GET_ALL_ACCOUNTS,
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

export const getAccountById = (accountId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.get(`/accounts/${accountId}`);
    dispatch({
      type: GET_ACCOUNT_BY_ID,
      payload: data.account,
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

export const createAccount = (accountData) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.post(`/accounts`, accountData);
    dispatch({
      type: CREATE_ACCOUNT,
      payload: data.account,
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

export const updateAccount = (accountData) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { id, ...updateData } = accountData;
    const { data } = await axios.put(`/accounts/${id}`, updateData);
    dispatch({
      type: UPDATE_ACCOUNT,
      payload: data.account,
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

export const activateAccount = (accountId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.post(`/accounts/${accountId}/activate`);
    dispatch({
      type: UPDATE_ACCOUNT,
      payload: data.account,
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

export const deActivateAccount = (accountId) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const { data } = await axios.post(`/accounts/${accountId}/deactivate`);
    dispatch({
      type: UPDATE_ACCOUNT,
      payload: data.account,
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
