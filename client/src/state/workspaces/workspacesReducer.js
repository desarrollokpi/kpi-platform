import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  READ_WORKSPACES_BY_ADMIN,
  READ_WORKSPACES_BY_USER,
  CLEAR_WORKSPACES,
  GET_ALL_WORKSPACES,
  GET_WORKSPACE_BY_ID,
  CREATE_WORKSPACE,
  UPDATE_WORKSPACE,
  DELETE_WORKSPACE,
  ACTIVATE_WORKSPACE,
  GET_INSTANCES_LIST,
  GET_ACCOUNTS_LIST,
} from "./workspacesTypes";

const initialState = {
  loading: false,
  message: null,
  workspaces: [],
  workspace: null,
  userWorkspaces: [],
  instancesList: [],
  accountsList: [],
  totalCount: 0,
};

const workspacesReducer = (state = initialState, action) => {
  switch (action.type) {
    case READ_WORKSPACES_BY_ADMIN:
      return {
        ...state,
        loading: false,
        workspaces: action.payload,
      };

    case READ_WORKSPACES_BY_USER:
      return {
        ...state,
        loading: false,
        userWorkspaces: action.payload,
      };

    case CLEAR_MESSAGE:
      return { ...state, message: null };

    case CLEAR_WORKSPACES:
      return { ...state, workspaces: [], userWorkspaces: [] };

    case LOADING:
      return { ...state, loading: action.payload };

    case ERROR:
      return { ...state, loading: false, message: action.payload };

    case GET_ALL_WORKSPACES:
      return {
        ...state,
        workspaces: action.payload.workspaces || action.payload,
        totalCount: action.payload.totalCount || (action.payload.workspaces ? action.payload.workspaces.length : action.payload.length),
        loading: false,
      };

    case GET_WORKSPACE_BY_ID:
      return {
        ...state,
        workspace: action.payload,
        loading: false,
      };

    case CREATE_WORKSPACE:
      return {
        ...state,
        workspaces: [...state.workspaces, action.payload],
        workspace: action.payload,
        loading: false,
        message: "Workspace creado exitosamente",
      };

    case UPDATE_WORKSPACE:
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => (workspace.id === action.payload.id ? action.payload : workspace)),
        workspace: action.payload,
        loading: false,
        message: "Workspace actualizado exitosamente",
      };

    case DELETE_WORKSPACE:
      return {
        ...state,
        workspaces: state.workspaces.filter((workspace) => workspace.id !== action.payload.workspaceId),
        loading: false,
        message: action.payload.message || "Workspace eliminado exitosamente",
      };

    case ACTIVATE_WORKSPACE:
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => (workspace.id === action.payload.id ? action.payload : workspace)),
        workspace: action.payload,
        loading: false,
        message: "Workspace activado exitosamente",
      };

    case GET_INSTANCES_LIST:
      return {
        ...state,
        loading: false,
        instancesList: action.payload,
      };

    case GET_ACCOUNTS_LIST:
      return {
        ...state,
        loading: false,
        accountsList: action.payload,
      };

    default:
      return state;
  }
};

export default workspacesReducer;
