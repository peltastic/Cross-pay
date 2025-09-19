import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TransactionStateModel } from './transaction.state';

export const selectTransactionState = createFeatureSelector<TransactionStateModel>('transaction');

export const selectTransactions = createSelector(
  selectTransactionState,
  (state) => state.transactions
);

export const selectTransactionFetching = createSelector(
  selectTransactionState,
  (state) => state.isFetching
);

export const selectTransactionFetchError = createSelector(
  selectTransactionState,
  (state) => state.fetchError
);

export const selectTransactionPagination = createSelector(
  selectTransactionState,
  (state) => ({
    totalCount: state.totalCount,
    currentPage: state.currentPage,
    pageSize: state.pageSize,
    hasMore: state.hasMore,
  })
);

export const selectTransactionLoadingMore = createSelector(
  selectTransactionState,
  (state) => state.isLoadingMore
);

export const selectTransactionLoadMoreError = createSelector(
  selectTransactionState,
  (state) => state.loadMoreError
);

export const selectTransactionHasMore = createSelector(
  selectTransactionState,
  (state) => {
    const startIndex = state.currentPage * state.pageSize;
    const endIndex = startIndex + state.pageSize;
    return endIndex < state.transactions.length;
  }
);

export const selectTransactionTotalCount = createSelector(
  selectTransactionState,
  (state) => state.totalCount
);

export const selectTransactionCurrentPage = createSelector(
  selectTransactionState,
  (state) => state.currentPage
);

export const selectTransactionPageSize = createSelector(
  selectTransactionState,
  (state) => state.pageSize
);

export const selectPaginatedTransactions = createSelector(
  selectTransactionState,
  (state) => {
    const startIndex = state.currentPage * state.pageSize;
    const endIndex = startIndex + state.pageSize;
    const paginatedTransactions = state.transactions.slice(startIndex, endIndex);
    const hasMore = endIndex < state.transactions.length;
    
    return {
      transactions: paginatedTransactions,
      pagination: {
        totalCount: state.transactions.length,
        currentPage: state.currentPage,
        pageSize: state.pageSize,
        hasMore: hasMore,
      },
      loading: state.isFetching,
      loadingMore: state.isLoadingMore,
      error: state.fetchError,
      loadMoreError: state.loadMoreError,
    };
  }
);
