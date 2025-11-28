import { ERROR, LOADING, CLEAR_MESSAGE, CREATE, READ_ALL, UPDATE, DELETE, UPDATE_PASSWORD, GET_ACCOUNTS_LIST, GET_ROLES_LIST } from "./usersTypes";

const initialState = {
  loading: false,
  message: null,
  users: [],
  accountsList: [],
  rolesList: [],
  totalCount: 0,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE:
      return {
        ...state,
        loading: false,
        users: [action.payload, ...state.users],
      };

    case READ_ALL:
      return {
        ...state,
        loading: false,
        users: action.payload.users || action.payload,
        totalCount: action.payload.totalCount || (action.payload.users ? action.payload.users.length : action.payload.length),
      };

    case UPDATE:
      return {
        ...state,
        loading: false,
        users: state.users.map((user) => (user.id === action.payload.id ? action.payload : user)),
      };

    case DELETE:
      return {
        ...state,
        loading: false,
        users: state.users.filter((user) => user.id !== action.payload.id),
      };

    case CLEAR_MESSAGE:
      return { ...state, message: null };

    case LOADING:
      return { ...state, loading: action.payload };

    case ERROR:
      return { ...state, loading: false, message: action.payload };

    case UPDATE_PASSWORD:
      return { ...state, loading: false };

    case GET_ACCOUNTS_LIST:
      return { ...state, loading: false, accountsList: action.payload };

    case GET_ROLES_LIST:
      return { ...state, loading: false, rolesList: action.payload };

    default:
      return state;
  }
};

export default userReducer;
