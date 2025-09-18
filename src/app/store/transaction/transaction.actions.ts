import { createAction, props } from '@ngrx/store';
import { TransactionModel } from '../../core/models/transactions.model';

export const GET_TRANSACTIONS_SUCCESS = '[Transaction] Get Transactions Success';
export const GET_TRANSACTIONS_FAILURE = '[Transaction] Get Transactions Failure';
export const GET_TRANSACTIONS = '[Transaction] Get Transactions';
export const LOAD_MORE_TRANSACTIONS = '[Transaction] Load More Transactions';
export const LOAD_MORE_TRANSACTIONS_SUCCESS = '[Transaction] Load More Transactions Success';
export const LOAD_MORE_TRANSACTIONS_FAILURE = '[Transaction] Load More Transactions Failure';
export const SET_TRANSACTION_PAGE_SIZE = '[Transaction] Set Page Size';
export const RESET_TRANSACTIONS = '[Transaction] Reset Transactions';

export interface PaginationRequest {
  walletAddress: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PaginatedTransactionResponse {
  transactions: TransactionModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export const getTransactions = createAction(
  GET_TRANSACTIONS,
  props<PaginationRequest>()
);

export const getTransactionsSuccess = createAction(
  GET_TRANSACTIONS_SUCCESS,
  props<{ response: PaginatedTransactionResponse }>()
);

export const getTransactionsFailure = createAction(
  GET_TRANSACTIONS_FAILURE,
  props<{ error: string }>()
);

export const loadMoreTransactions = createAction(
  LOAD_MORE_TRANSACTIONS,
  props<PaginationRequest>()
);

export const loadMoreTransactionsSuccess = createAction(
  LOAD_MORE_TRANSACTIONS_SUCCESS,
  props<{ response: PaginatedTransactionResponse }>()
);

export const loadMoreTransactionsFailure = createAction(
  LOAD_MORE_TRANSACTIONS_FAILURE,
  props<{ error: string }>()
);

export const setTransactionPageSize = createAction(
  SET_TRANSACTION_PAGE_SIZE,
  props<{ pageSize: number }>()
);

export const resetTransactions = createAction(
  RESET_TRANSACTIONS
);
