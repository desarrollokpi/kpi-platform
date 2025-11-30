export const extractErrorMessage = (error) => {
  if (error.response && error.response.data) {
    const data = error.response.data;

    if (typeof data.error === "string" && data.error.trim() !== "") {
      return data.error;
    }

    if (typeof data.message === "string" && data.message.trim() !== "") {
      return data.message;
    }
  }

  if (error.message) {
    return error.message;
  }

  return "Ocurrió un error inesperado";
};

export const setLoading = (dispatch, value, type) => dispatch({ type, payload: value });
export const clearMessage =
  (type, waitTime = 5) =>
  (dispatch) => {
    setTimeout(() => {
      dispatch({ type });
    }, waitTime * 1000);
  };

export const handleError = (dispatch, type, error) => {
  dispatch({
    type,
    payload: extractErrorMessage(error),
  });
};
