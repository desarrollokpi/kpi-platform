import {
  LOADING,
  ERROR,
  CLEAR_MESSAGE,
  GET_ALL_INSTANCES,
  GET_INSTANCE_BY_ID,
  CREATE_INSTANCE,
  UPDATE_INSTANCE,
  DELETE_INSTANCE,
  ACTIVATE_INSTANCE,
  GET_INSTANCES_BY_ACCOUNT,
  ASSIGN_INSTANCE_TO_ACCOUNT,
  REMOVE_INSTANCE_FROM_ACCOUNT,
  SYNC_INSTANCE_WORKSPACES,
  GET_ACCOUNTS_LIST,
} from "./instancesTypes";

const initialState = {
  loading: false,
  message: null,
  instances: [],
  instance: null,
  totalCount: 0,
  accountsList: [],
};

const instancesReducer = (state = initialState, action) => {
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

    case GET_ALL_INSTANCES:
      return {
        ...state,
        instances: action.payload.instances || action.payload,
        totalCount: action.payload.totalCount || (action.payload.instances ? action.payload.instances.length : action.payload.length),
        loading: false,
      };

    case GET_INSTANCE_BY_ID:
      return {
        ...state,
        instance: action.payload,
        loading: false,
      };

    case CREATE_INSTANCE:
      return {
        ...state,
        instances: [...state.instances, action.payload],
        instance: action.payload,
        loading: false,
        message: "Instancia creada exitosamente",
      };

    case UPDATE_INSTANCE:
      return {
        ...state,
        instances: state.instances.map((instance) => (instance.id === action.payload.id ? action.payload : instance)),
        instance: action.payload,
        loading: false,
        message: "Instancia actualizada exitosamente",
      };

    case DELETE_INSTANCE:
      return {
        ...state,
        instances: state.instances.filter((instance) => instance.id !== action.payload.instanceId),
        loading: false,
        message: action.payload.message || "Instancia eliminada exitosamente",
      };

    case ACTIVATE_INSTANCE:
      return {
        ...state,
        instances: state.instances.map((instance) => (instance.id === action.payload.id ? action.payload : instance)),
        instance: action.payload,
        loading: false,
        message: "Instancia activada exitosamente",
      };

    case GET_INSTANCES_BY_ACCOUNT:
      return {
        ...state,
        instances: action.payload.instances || action.payload,
        totalCount: action.payload.count || (action.payload.instances ? action.payload.instances.length : action.payload.length),
        loading: false,
      };

    case ASSIGN_INSTANCE_TO_ACCOUNT:
      return {
        ...state,
        loading: false,
        message: action.payload.message || "Instancia asignada exitosamente",
      };

    case REMOVE_INSTANCE_FROM_ACCOUNT:
      return {
        ...state,
        instances: state.instances.filter((instance) => instance.id !== action.payload.instanceId),
        loading: false,
        message: action.payload.message || "Instancia removida de la cuenta exitosamente",
      };

    case SYNC_INSTANCE_WORKSPACES:
      return {
        ...state,
        loading: false,
        message: action.payload.message || "Workspaces sincronizados exitosamente",
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

export default instancesReducer;
