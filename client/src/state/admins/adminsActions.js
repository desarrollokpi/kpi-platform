import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  UPDATE_LOGO,
  READ_LOGO,
  ACCEPT_TERMS_AND_CONDITIONS,
  CHANGE_USER_PASSWORD,
  READ_USERS_WORKSPACE,
  READ_ADMINS_BY_SUPERUSER,
} from "./adminsTypes";

import axios from "axios";
import { config } from "../../util/state";

const setLoading = (dispatch, value) => dispatch({ type: LOADING, payload: value });

export const handleError = (dispatch, error) => {
  dispatch({ type: ERROR, payload: error.response.data });
  setTimeout(() => {
    dispatch({ type: CLEAR_MESSAGE, payload: error.response.data.message });
  }, 3000);
};

export const changeUserPassword = (userId, password) => async (dispatch) => {
  setLoading(dispatch, true);

  try {
    await axios.put(`/admins/changeUserPassword`, { userId, password }, config);
    dispatch({ type: CHANGE_USER_PASSWORD });
  } catch (error) {
    handleError(dispatch, error);
  } finally {
    setLoading(dispatch, false);
  }
};

export const readLogo = () => async (dispatch) => {
  setLoading(dispatch, true);

  try {
    const res = await axios.get(`/admins/logo`);
    dispatch({ type: READ_LOGO, payload: res.data });
  } catch (error) {
    dispatch({ type: ERROR, payload: error.response.data.message });
  } finally {
    setLoading(dispatch, false);
  }
};

export const readSubdmain = (user) => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const res = await axios.get(`/users/${user}`);
    dispatch({ type: READ_USERS_WORKSPACE, payload: res.data });
  } catch (error) {
    dispatch({ type: ERROR, payload: error.response.data.message });
  } finally {
    setLoading(dispatch, false);
  }
};

export const readAdminsBySuperuser = () => async (dispatch) => {
  setLoading(dispatch, true);
  try {
    const res = await axios.get(`/admins`);
    dispatch({ type: READ_ADMINS_BY_SUPERUSER, payload: res.data });
  } catch (error) {
    dispatch({ type: ERROR, payload: error.response.data.message });
  } finally {
    setLoading(dispatch, false);
  }
};

export const acceptTermsAndConditions = (termsAndConditions) => async (dispatch) => {
  setLoading(dispatch, true);

  try {
    const res = await axios.post(`/admins/termsAndConditions`, { termsAndConditionsId: termsAndConditions.id }, config);
    dispatch({ type: ACCEPT_TERMS_AND_CONDITIONS, payload: res.data });
  } catch (error) {
    dispatch({ type: ERROR, payload: error.response.data.message });
  } finally {
    setLoading(dispatch, false);
  }
};

export const updateLogo = (logoFile) => async (dispatch) => {
  setLoading(dispatch, true);

  let data = new FormData();
  data.append("image", logoFile);

  try {
    const res = await axios.put(`/admins/logo`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    dispatch({ type: UPDATE_LOGO, payload: res.data.logo });
  } catch (error) {
    handleError(dispatch, error);
  } finally {
    setLoading(dispatch, false);
  }
};
