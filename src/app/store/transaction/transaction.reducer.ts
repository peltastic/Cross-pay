import { Action, createReducer, on } from '@ngrx/store';
import { initialState } from './transaction.state';
import {
  getTransactions,
  getTransactionsSuccess,
  getTransactionsFailure,
  loadMoreTransactions,
  loadMoreTransactionsSuccess,
  loadMoreTransactionsFailure,
  setTransactionPageSize,
  resetTransactions,
  nextPage,
  setPageAction,
} from './transaction.actions';

const _transactionReducer = createReducer(
  initialState,
  
  on(getTransactions, (state) => ({
    ...state,
    isFetching: true,
    fetchError: null,
  })),
  
  on(getTransactionsSuccess, (state, { response }) => ({
    ...state,
    transactions: response.transactions,
    totalCount: response.transactions.length,
    currentPage: 0,
    pageSize: state.pageSize,
    hasMore: response.transactions.length > state.pageSize,
    isFetching: false,
    fetchError: null,
  })),
  
  on(getTransactionsFailure, (state, { error }) => ({
    ...state,
    isFetching: false,
    fetchError: error,
  })),
  
  on(loadMoreTransactions, (state) => ({
    ...state,
    isLoadingMore: true,
    loadMoreError: null,
  })),
  
  on(loadMoreTransactionsSuccess, (state, { response }) => ({
    ...state,
    transactions: [...state.transactions, ...response.transactions],
    currentPage: state.currentPage + 1,
    hasMore: response.hasMore,
    isLoadingMore: false,
    loadMoreError: null,
  })),
  
  on(loadMoreTransactionsFailure, (state, { error }) => ({
    ...state,
    isLoadingMore: false,
    loadMoreError: error,
  })),
  
  on(setTransactionPageSize, (state, { pageSize }) => ({
    ...state,
    pageSize,
  })),
  
  on(resetTransactions, () => initialState),
  
  on(nextPage, (state) => ({
    ...state,
    currentPage: state.currentPage + 1,
  })),
  
  on(setPageAction, (state, { page }) => ({
    ...state,
    currentPage: page,
  }))
);

export function transactionReducer(state: any | undefined, action: Action) {
  return _transactionReducer(state, action);
}
