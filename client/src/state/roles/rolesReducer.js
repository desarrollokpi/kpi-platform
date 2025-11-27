import {
  LOADING,
  ERROR,
  CLEAR_MESSAGE,
  GET_ALL_ROLES,
  GET_ROLE_BY_ID,
  GET_USER_ROLES,
  ASSIGN_ROLE_TO_USER,
  REMOVE_ROLE_FROM_USER,
} from "./rolesTypes";

const initialState = {
  loading: false,
  message: null,
  roles: [],
  role: null,
  userRoles: [],
};

const rolesReducer = (state = initialState, action) => {
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

    case GET_ALL_ROLES:
      return {
        ...state,
        roles: action.payload.roles || action.payload,
        loading: false,
      };

    case GET_ROLE_BY_ID:
      return {
        ...state,
        role: action.payload,
        loading: false,
      };

    case GET_USER_ROLES:
      return {
        ...state,
        userRoles: action.payload.roles || action.payload,
        loading: false,
      };

    case ASSIGN_ROLE_TO_USER:
      return {
        ...state,
        loading: false,
        message: action.payload.message || "Rol asignado exitosamente",
      };

    case REMOVE_ROLE_FROM_USER:
      return {
        ...state,
        userRoles: state.userRoles.filter(
          (role) => role.id !== action.payload.roleId
        ),
        loading: false,
        message: action.payload.message || "Rol removido exitosamente",
      };

    default:
      return state;
  }
};

export default rolesReducer;
