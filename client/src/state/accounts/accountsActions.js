import axios from "axios";
import { setLoading, clearMessage, handleError } from "../common/utils";
import { ERROR, LOADING, CLEAR_MESSAGE, READ_LOGO_BY_SUBDOMAIN, GET_ALL_ACCOUNTS, CREATE_ACCOUNT, UPDATE_ACCOUNT, GET_ACCOUNT_BY_ID } from "./accountsTypes";

export const readLogoBySubdomain = (subdomain) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.get(`/accounts/logoBySubdomain`, { params: { subdomain } });
    dispatch({
      type: READ_LOGO_BY_SUBDOMAIN,
      payload: data || null,
      meta: { subdomain },
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

export const getAccountsLists = (options) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.get(`/accounts`, { params: { ...options } });
    dispatch({
      type: GET_ALL_ACCOUNTS,
      payload: data,
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

export const getAccountById = (accountId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.get(`/accounts/${accountId}`);
    dispatch({
      type: GET_ACCOUNT_BY_ID,
      payload: data.account,
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

export const createAccount = (accountData) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.post(`/accounts`, accountData);
    dispatch({
      type: CREATE_ACCOUNT,
      payload: data.account,
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

export const updateAccount = (accountId, updateData) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.put(`/accounts/${accountId}`, updateData);
    dispatch({
      type: UPDATE_ACCOUNT,
      payload: data.account,
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

export const activateAccount = (accountId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.post(`/accounts/${accountId}/activate`);
    dispatch({
      type: UPDATE_ACCOUNT,
      payload: data.account,
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

export const deActivateAccount = (accountId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.post(`/accounts/${accountId}/deactivate`);
    dispatch({
      type: UPDATE_ACCOUNT,
      payload: data.account,
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};

export const deleteAccount = (accountId) => async (dispatch) => {
  setLoading(dispatch, true, LOADING);
  try {
    const { data } = await axios.delete(`/accounts/${accountId}`);
    dispatch({
      type: UPDATE_ACCOUNT,
      payload: { id: accountId, deleted: true, message: data.message },
    });
  } catch (error) {
    handleError(dispatch, ERROR, error);
  } finally {
    setLoading(dispatch, false, LOADING);
    clearMessage(CLEAR_MESSAGE);
  }
};
