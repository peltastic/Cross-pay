import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import {
  selectTransactionState,
  selectTransactions,
  selectTransactionPagination,
  selectTransactionFetching,
  selectTransactionFetchError,
  selectTransactionLoadingMore,
  selectTransactionHasMore,
  selectPaginatedTransactions,
} from './transaction.selector';
import { TransactionStateModel } from './transaction.state';
import { TransactionModel } from '../../core/models/transactions.model';

describe('Transaction Selectors', () => {
  let store: MockStore;

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

  const mockTransactionState: TransactionStateModel = {
    transactions: mockTransactions,
    totalCount: 50,
    currentPage: 1,
    pageSize: 20,
    hasMore: true,
    isFetching: false,
    fetchError: null,
    isLoadingMore: false,
    loadMoreError: 'Load more error',
    sortBy: 'createdAt',
    sortDirection: 'desc',
  };

  const initialState = {
    transaction: mockTransactionState,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore({ initialState })],
    });

    store = TestBed.inject(MockStore);
  });

  describe('selectTransactionState', () => {
    it('should select the transaction state', (done) => {
      store.select(selectTransactionState).subscribe((result) => {
        expect(result).toEqual(mockTransactionState);
        done();
      });
    });
  });

  describe('selectTransactions', () => {
    it('should select transactions array', (done) => {
      store.select(selectTransactions).subscribe((result) => {
        expect(result).toEqual(mockTransactions);
        done();
      });
    });
  });

  describe('selectTransactionPagination', () => {
    it('should select pagination info', (done) => {
      store.select(selectTransactionPagination).subscribe((result) => {
        expect(result).toEqual({
          totalCount: 50,
          currentPage: 1,
          pageSize: 20,
          hasMore: true,
        });
        done();
      });
    });
  });

  describe('selectTransactionFetching', () => {
    it('should select isFetching state', (done) => {
      store.select(selectTransactionFetching).subscribe((result) => {
        expect(result).toBe(false);
        done();
      });
    });
  });

  describe('selectTransactionFetchError', () => {
    it('should select fetchError', (done) => {
      store.select(selectTransactionFetchError).subscribe((result) => {
        expect(result).toBe(null);
        done();
      });
    });
  });

  describe('selectTransactionLoadingMore', () => {
    it('should select isLoadingMore state', (done) => {
      store.select(selectTransactionLoadingMore).subscribe((result) => {
        expect(result).toBe(false);
        done();
      });
    });
  });

  describe('selectTransactionHasMore', () => {
    it('should select hasMore state', (done) => {
      store.select(selectTransactionHasMore).subscribe((result) => {
        expect(result).toBe(true);
        done();
      });
    });
  });

  describe('selectPaginatedTransactions', () => {
    it('should select comprehensive paginated data', (done) => {
      store.select(selectPaginatedTransactions).subscribe((result) => {
        expect(result).toEqual({
          transactions: mockTransactions,
          pagination: {
            totalCount: 50,
            currentPage: 1,
            pageSize: 20,
            hasMore: true,
          },
          loading: false,
          loadingMore: false,
          error: null,
          loadMoreError: 'Load more error',
        });
        done();
      });
    });
  });

  describe('selectPaginatedTransactions with loading states', () => {
    it('should reflect loading states correctly', (done) => {
      const loadingState = {
        ...mockTransactionState,
        isFetching: true,
        isLoadingMore: true,
        fetchError: 'Network error',
      };

      store.setState({
        transaction: loadingState,
      });

      store.select(selectPaginatedTransactions).subscribe((result) => {
        expect(result.loading).toBe(true);
        expect(result.loadingMore).toBe(true);
        expect(result.error).toBe('Network error');
        done();
      });
    });
  });

  describe('selectPaginatedTransactions with empty state', () => {
    it('should handle empty transactions state', (done) => {
      const emptyState = {
        ...mockTransactionState,
        transactions: [],
        totalCount: 0,
        hasMore: false,
      };

      store.setState({
        transaction: emptyState,
      });

      store.select(selectPaginatedTransactions).subscribe((result) => {
        expect(result.transactions).toEqual([]);
        expect(result.pagination.totalCount).toBe(0);
        expect(result.pagination.hasMore).toBe(false);
        done();
      });
    });
  });
});
