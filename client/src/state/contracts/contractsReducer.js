import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  READ_CONTRACT_BY_ADMIN,
  READ_CONTRACT_DETAILS_BY_ADMIN,
  UPDATE_CONTRACT_DETAIL,
  UPDATE_CONTRACT,
} from './contractsTypes'

const initialState = {
  loading: false,
  message: null,
  contract: undefined,
  contractDetails: [],
}

const contractsReducer = (state = initialState, action) => {
  switch (action.type) {
    case READ_CONTRACT_BY_ADMIN:
    case UPDATE_CONTRACT:
      return { ...state, contract: action.payload, loading: false }

    case UPDATE_CONTRACT_DETAIL:
      return {
        ...state,
        loading: false,
        contractDetails: state.contractDetails.map(contractDetail =>
          contractDetail.id === action.payload.id
            ? action.payload
            : contractDetail
        ),
      }

    case READ_CONTRACT_DETAILS_BY_ADMIN:
      return { ...state, contractDetails: action.payload, loading: false }

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

export default contractsReducer
