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
    totalCount: response.totalCount,
    currentPage: response.page,
    pageSize: response.pageSize,
    hasMore: response.hasMore,
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
    totalCount: response.totalCount,
    currentPage: response.page,
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
  
  on(resetTransactions, () => initialState)
);

export function transactionReducer(state: any | undefined, action: Action) {
  return _transactionReducer(state, action);
}
