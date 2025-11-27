import { ERROR, LOADING, READ_PROFILE, SIGN_IN, CLEAR_MESSAGE, SIGN_OUT, TIME_AVAILABLE } from "./authTypes";

const initialState = {
  loading: false,
  message: null,
  isAuthenticated: false,
  user: null,
  userLogo: null,
  timeAvailable: null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOADING:
      return { ...state, loading: action.payload };

    case SIGN_IN:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
      };

    case READ_PROFILE:
      return {
        ...state,
        loading: false,
        user: { ...state.user, ...action.payload.user },
        isAuthenticated: true,
      };

    case CLEAR_MESSAGE:
      return { ...state, message: null };

    case ERROR: {
      const shouldInvalidate = action.payload?.invalidateSession;
      return {
        ...state,
        loading: false,
        isAuthenticated: shouldInvalidate ? false : state.isAuthenticated,
        user: shouldInvalidate ? null : state.user,
        message: {
          text: action.payload?.message || action.payload || "Error",
          severity: "error",
        },
      };
    }

    case SIGN_OUT:
      return {
        ...initialState,
        loading: false,
      };

    case TIME_AVAILABLE:
      return {
        ...state,
        loading: false,
        timeAvailable: action.payload?.time ?? null,
      };

    default:
      return state;
  }
};

export default authReducer;
