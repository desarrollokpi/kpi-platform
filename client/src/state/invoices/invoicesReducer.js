import {
  ERROR,
  LOADING,
  CLEAR_MESSAGE,
  READ_INVOICES_BY_CONTRACT,
  READ_INVOICES_DETAIL_BY_CONTRACT,
} from './invoicesTypes'

const initialState = {
  loading: false,
  message: null,
  invoices: [],
  invoiceDetails: [],
}

const invoicesReducer = (state = initialState, action) => {
  switch (action.type) {
    case READ_INVOICES_BY_CONTRACT:
      return { ...state, invoices: action.payload, loading: false }

    case READ_INVOICES_DETAIL_BY_CONTRACT:
      return { ...state, invoiceDetails: action.payload, loading: false }

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

export default invoicesReducer
