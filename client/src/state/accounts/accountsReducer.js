import { READ_LOGO_BY_SUBDOMAIN, LOADING, ERROR, CLEAR_MESSAGE, GET_ALL_ACCOUNTS, CREATE_ACCOUNT, UPDATE_ACCOUNT, GET_ACCOUNT_BY_ID } from "./accountsTypes";

const initialState = {
  loading: false,
  message: null,
  subdomain: undefined,
  appBarLogo: undefined,
  accounts: [],
  account: null,
  totalCount: 0,
};

const adminReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOADING:
      return { ...state, loading: action.payload };

    case CLEAR_MESSAGE:
      return { ...state, message: null };

    case ERROR:
      return {
        ...state,
        loading: false,
        message: action.payload,
      };

    case READ_LOGO_BY_SUBDOMAIN:
      return {
        ...state,
        appBarLogo: action.payload,
        subdomain: action.meta?.subdomain || state.subdomain,
        loading: false,
        message: null,
      };

    case GET_ALL_ACCOUNTS:
      return {
        ...state,
        accounts: action.payload.accounts || action.payload,
        totalCount: action.payload.totalCount || (action.payload.accounts ? action.payload.accounts.length : action.payload.length),
      };

    case GET_ACCOUNT_BY_ID:
      return {
        ...state,
        account: action.payload,
        loading: false,
      };

    case CREATE_ACCOUNT:
      return {
        ...state,
        accounts: [...state.accounts, action.payload],
        account: action.payload,
        loading: false,
        message: "Cuenta creada exitosamente",
      };

    case UPDATE_ACCOUNT:
      return {
        ...state,
        accounts: state.accounts.map((acc) => (acc.id === action.payload.id ? action.payload : acc)),
        account: action.payload,
        loading: false,
        message: "Cuenta actualizada exitosamente",
      };

    default:
      return state;
  }
};

export default adminReducer;
