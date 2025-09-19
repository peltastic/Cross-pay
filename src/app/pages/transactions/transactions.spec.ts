import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { Transactions } from './transactions';
import * as TransactionActions from '../../store/transaction/transaction.actions';
import * as UserActions from '../../store/user/user.actions';
import * as WalletActions from '../../store/wallet/wallet.actions';
import { TransactionModel } from '../../core/models/transactions.model';
import { SessionStorageService } from '../../core/services/session-storage.service';

describe('Transactions', () => {
  let component: Transactions;
  let fixture: ComponentFixture<Transactions>;
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

  const mockPaginatedData = {
    transactions: mockTransactions,
    pagination: {
      totalCount: 50,
      currentPage: 0,
      pageSize: 20,
      hasMore: true,
    },
    loading: false,
    loadingMore: false,
    error: null,
    loadMoreError: null,
  };

  const initialState = {
    transaction: {
      transactions: mockTransactions,
      pagination: {
        totalCount: 50,
        currentPage: 0,
        pageSize: 20,
        hasMore: true,
      },
      loading: false,
      loadingMore: false,
      error: null,
      loadMoreError: null,
    },
    wallet: {
      wallet: {
        id: 'wallet-1',
        walletAddress: 'wallet-address-1',
        email: 'test@example.com',
        balances: { USD: 1000, EUR: 500 },
      },
      isFetching: false,
      fetchWalletError: null,
    },
  };

  beforeEach(async () => {
    const sessionStorageServiceSpy = jasmine.createSpyObj('SessionStorageService', ['getItem']);

    await TestBed.configureTestingModule({
      imports: [Transactions],
      providers: [
        provideMockStore({ initialState }),
        { provide: SessionStorageService, useValue: sessionStorageServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(Transactions);
    component = fixture.componentInstance;

    const sessionStorageService = TestBed.inject(
      SessionStorageService
    ) as jasmine.SpyObj<SessionStorageService>;
    sessionStorageService.getItem.and.returnValue('test@example.com');

    spyOn(store, 'dispatch');
    spyOn(store, 'select').and.callFake((selector: any) => {
      if (selector.toString().includes('selectPaginatedTransactions')) {
        return of(mockPaginatedData);
      }
      if (selector.toString().includes('selectTransactionHasMore')) {
        return of(true);
      }
      if (selector.toString().includes('selectTransactionLoadingMore')) {
        return of(false);
      }
      if (selector.toString().includes('selectWallet')) {
        return of(initialState.wallet.wallet);
      }
      return of(null);
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize data table columns', () => {
    expect(component.columns).toBeDefined();
    expect(component.columns.length).toBe(5);
    expect(component.columns[0].key).toBe('id');
    expect(component.columns[0].header).toBe('Transaction ID');
  });

  it('should dispatch actions on initialization', fakeAsync(() => {
    // Check that initialization actions were called with correct action types
    expect(store.dispatch).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: '[User] Set Email',
      })
    );
    expect(store.dispatch).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: '[Wallet] Get Wallet',
      })
    );

    flush();
  }));

  it('should handle load more transactions', (done) => {
    (store.dispatch as jasmine.Spy).calls.reset();

    component['currentWalletAddress'] = 'wallet-address-1';

    component.paginatedData$ = of(mockPaginatedData);

    component.onLoadMore();

    setTimeout(() => {
      expect(store.dispatch).toHaveBeenCalledWith(
        TransactionActions.nextPage()
      );
      done();
    }, 0);
  });

  it('should handle page size change', () => {
    (store.dispatch as jasmine.Spy).calls.reset();
    component['currentWalletAddress'] = 'wallet-address-1';

    component.onPageSizeChange(50);

    expect(store.dispatch).toHaveBeenCalledWith(
      TransactionActions.setTransactionPageSize({ pageSize: 50 })
    );
    expect(store.dispatch).toHaveBeenCalledWith(
      TransactionActions.getTransactions({
        walletAddress: 'wallet-address-1',
        page: 0,
        pageSize: 10,
      })
    );
  });

  it('should not load transactions if no wallet address', () => {
    component['currentWalletAddress'] = null;
    component.onLoadMore();

    expect(store.dispatch).not.toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: '[Transaction] Load More Transactions',
      })
    );
  });

  it('should not load more if hasMore is false', () => {
    const mockDataWithoutMore = {
      ...mockPaginatedData,
      pagination: {
        ...mockPaginatedData.pagination,
        hasMore: false,
      },
    };

    (store.select as jasmine.Spy).and.callFake((selector: any) => {
      if (selector.toString().includes('selectPaginatedTransactions')) {
        return of(mockDataWithoutMore);
      }
      return of(null);
    });

    component.onLoadMore();

    expect(store.dispatch).not.toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: '[Transaction] Load More Transactions',
      })
    );
  });

  it('should clean up on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
