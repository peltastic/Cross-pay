import { TransactionStateModel, initialState } from './transaction.state';
import { transactionReducer } from './transaction.reducer';
import * as TransactionActions from './transaction.actions';
import { TransactionModel } from '../../core/models/transactions.model';

describe('Transaction Reducer', () => {
  const mockTransactions: TransactionModel[] = [
    {
      id: '1',
      email: 'test@example.com',
      walletAddress: 'wallet-1',
      destinationAddress: 'wallet-2',
      amount: 100,
      transactionType: 'transfer',
      direction: 'debit',
      currency: 'USD',
      createdAt: '2024-01-01T12:00:00Z',
    },
    {
      id: '2',
      email: 'test2@example.com',
      walletAddress: 'wallet-1',
      amount: 50,
      transactionType: 'deposit',
      direction: 'credit',
      currency: 'EUR',
      createdAt: '2024-01-01T12:00:00Z',
    },
  ];

  const mockPaginatedResponse: TransactionActions.PaginatedTransactionResponse = {
    transactions: mockTransactions,
    totalCount: 50,
    page: 0,
    pageSize: 20,
    hasMore: true,
  };

  describe('unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;
      const result = transactionReducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('getTransactions action', () => {
    it('should set isFetching to true and clear fetchError', () => {
      const action = TransactionActions.getTransactions({
        walletAddress: 'wallet-1',
        page: 0,
        pageSize: 20,
      });
      const result = transactionReducer(initialState, action);

      expect(result.isFetching).toBe(true);
      expect(result.fetchError).toBe(null);
    });
  });

  describe('getTransactionsSuccess action', () => {
    it('should update state with transactions and pagination', () => {
      const action = TransactionActions.getTransactionsSuccess({ response: mockPaginatedResponse });
      const result = transactionReducer(initialState, action);

      expect(result.isFetching).toBe(false);
      expect(result.transactions).toEqual(mockTransactions);
      expect(result.totalCount).toBe(50);
      expect(result.currentPage).toBe(0);
      expect(result.pageSize).toBe(20);
      expect(result.hasMore).toBe(true);
      expect(result.fetchError).toBe(null);
    });
  });

  describe('getTransactionsFailure action', () => {
    it('should set fetchError and stop isFetching', () => {
      const error = 'Failed to load transactions';
      const action = TransactionActions.getTransactionsFailure({ error });
      const result = transactionReducer(initialState, action);

      expect(result.isFetching).toBe(false);
      expect(result.fetchError).toBe(error);
    });
  });

  describe('loadMoreTransactions action', () => {
    it('should set isLoadingMore to true and clear loadMoreError', () => {
      const action = TransactionActions.loadMoreTransactions({
        walletAddress: 'wallet-1',
        page: 1,
        pageSize: 20,
      });
      const result = transactionReducer(initialState, action);

      expect(result.isLoadingMore).toBe(true);
      expect(result.loadMoreError).toBe(null);
    });
  });

  describe('loadMoreTransactionsSuccess action', () => {
    it('should append new transactions and update pagination', () => {
      const existingState: TransactionStateModel = {
        ...initialState,
        transactions: [mockTransactions[0]],
        totalCount: 50,
        currentPage: 0,
        pageSize: 20,
        hasMore: true,
      };

      const newTransactions = [mockTransactions[1]];
      const action = TransactionActions.loadMoreTransactionsSuccess({
        response: {
          transactions: newTransactions,
          totalCount: 50,
          page: 1,
          pageSize: 20,
          hasMore: false,
        },
      });
      const result = transactionReducer(existingState, action);

      expect(result.isLoadingMore).toBe(false);
      expect(result.transactions).toEqual([...existingState.transactions, ...newTransactions]);
      expect(result.currentPage).toBe(1);
      expect(result.hasMore).toBe(false);
      expect(result.loadMoreError).toBe(null);
    });
  });

  describe('loadMoreTransactionsFailure action', () => {
    it('should set loadMoreError and stop isLoadingMore', () => {
      const error = 'Failed to load more transactions';
      const action = TransactionActions.loadMoreTransactionsFailure({ error });
      const result = transactionReducer(initialState, action);

      expect(result.isLoadingMore).toBe(false);
      expect(result.loadMoreError).toBe(error);
    });
  });

  describe('setTransactionPageSize action', () => {
    it('should update page size', () => {
      const action = TransactionActions.setTransactionPageSize({ pageSize: 50 });
      const result = transactionReducer(initialState, action);

      expect(result.pageSize).toBe(50);
    });
  });

  describe('resetTransactions action', () => {
    it('should reset state to initial state', () => {
      const modifiedState: TransactionStateModel = {
        ...initialState,
        transactions: mockTransactions,
        totalCount: 50,
        currentPage: 2,
        pageSize: 20,
        hasMore: false,
        isFetching: true,
        isLoadingMore: true,
        fetchError: 'Some error',
        loadMoreError: 'Load more error',
      };

      const action = TransactionActions.resetTransactions();
      const result = transactionReducer(modifiedState, action);

      expect(result).toEqual(initialState);
    });
  });
});
