import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  READ_IDENTIFICATION_DOCUMENTS,
} from './identificationDocumentsTypes'

const initialState = {
  loading: false,
  message: null,
  identificationDocuments: [],
}

const locationsReducer = (state = initialState, action) => {
  switch (action.type) {
    case READ_IDENTIFICATION_DOCUMENTS:
      return {
        ...state,
        identificationDocuments: action.payload,
        loading: false,
      }

    case CLEAR_MESSAGE:
      return { ...state, message: null }

    case LOADING:
      return { ...state, loading: action.payload }

    case ERROR:
      return { ...state, loading: false, message: action.payload }

    default:
      return state
  }
}

export default locationsReducer
