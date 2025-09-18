import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TransactionService } from './transaction.service';
import { TransactionModel } from '../models/transactions.model';
import { PaginationRequest } from '../../store/transaction/transaction.actions';

describe('TransactionService', () => {
  let service: TransactionService;
  let httpMock: HttpTestingController;

  const mockTransactions: TransactionModel[] = [
    {
      id: 'tx-1',
      email: 'user@example.com',
      walletAddress: 'wallet-1',
      destinationAddress: 'wallet-2',
      amount: 100,
      transactionType: 'transfer',
      direction: 'debit',
      currency: 'USD',
      createdAt: '2023-01-01T10:00:00Z',
    },
    {
      id: 'tx-2',
      email: 'user@example.com',
      walletAddress: 'wallet-1',
      destinationAddress: 'wallet-3',
      amount: 50,
      transactionType: 'transfer',
      direction: 'credit',
      currency: 'EUR',
      createdAt: '2023-01-02T15:30:00Z',
    },
    {
      id: 'tx-3',
      email: 'user@example.com',
      walletAddress: 'wallet-1',
      amount: 1000,
      transactionType: 'deposit',
      direction: 'credit',
      currency: 'NGN',
      createdAt: '2023-01-03T09:15:00Z',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TransactionService],
    });

    service = TestBed.inject(TransactionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTransactions', () => {
    it('should fetch transactions for a given wallet address', () => {
      const walletAddress = 'wallet-123';

      service.getTransactions(walletAddress).subscribe((transactions) => {
        expect(transactions).toEqual(mockTransactions);
        expect(transactions.length).toBe(3);
        expect(transactions[0].id).toBe('tx-1');
        expect(transactions[1].direction).toBe('credit');
      });

      const expectedUrl = `/api/transactions/${encodeURIComponent(walletAddress)}`;
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockTransactions);
    });

    it('should encode special characters in wallet address', () => {
      const walletAddress = 'wallet+special@address';

      service.getTransactions(walletAddress).subscribe();

      const expectedUrl = `/api/transactions/${encodeURIComponent(walletAddress)}`;
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.url).toBe(expectedUrl);
      req.flush(mockTransactions);
    });

    it('should handle empty wallet address', () => {
      const walletAddress = '';

      service.getTransactions(walletAddress).subscribe();

      const expectedUrl = `/api/transactions/${encodeURIComponent(walletAddress)}`;
      const req = httpMock.expectOne(expectedUrl);
      req.flush([]);
    });

    it('should return empty array when no transactions found', () => {
      const walletAddress = 'empty-wallet';

      service.getTransactions(walletAddress).subscribe((transactions) => {
        expect(transactions).toEqual([]);
        expect(transactions.length).toBe(0);
      });

      const req = httpMock.expectOne(`/api/transactions/${encodeURIComponent(walletAddress)}`);
      req.flush([]);
    });

    it('should handle HTTP errors', () => {
      const walletAddress = 'wallet-123';

      service.getTransactions(walletAddress).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        },
      });

      const req = httpMock.expectOne(`/api/transactions/${encodeURIComponent(walletAddress)}`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle wallet not found error', () => {
      const walletAddress = 'non-existent-wallet';

      service.getTransactions(walletAddress).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        },
      });

      const req = httpMock.expectOne(`/api/transactions/${encodeURIComponent(walletAddress)}`);
      req.flush('Wallet not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle network errors', () => {
      const walletAddress = 'wallet-123';

      service.getTransactions(walletAddress).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        },
      });

      const req = httpMock.expectOne(`/api/transactions/${encodeURIComponent(walletAddress)}`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('getTransactionsPaginated', () => {
    it('should fetch paginated transactions', () => {
      const paginationRequest: PaginationRequest = {
        walletAddress: 'wallet-123',
        page: 1,
        pageSize: 10,
      };

      service.getTransactionsPaginated(paginationRequest).subscribe((transactions) => {
        expect(transactions).toEqual(mockTransactions);
        expect(transactions.length).toBe(3);
      });

      const expectedUrl = `/api/transactions/${encodeURIComponent(
        paginationRequest.walletAddress
      )}`;
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockTransactions);
    });

    it('should handle pagination with page 0', () => {
      const paginationRequest: PaginationRequest = {
        walletAddress: 'wallet-123',
        page: 0,
        pageSize: 5,
      };

      service.getTransactionsPaginated(paginationRequest).subscribe();

      const req = httpMock.expectOne(
        `/api/transactions/${encodeURIComponent(paginationRequest.walletAddress)}`
      );
      req.flush(mockTransactions);
    });

    it('should handle pagination with high page number', () => {
      const paginationRequest: PaginationRequest = {
        walletAddress: 'wallet-123',
        page: 999,
        pageSize: 10,
      };

      service.getTransactionsPaginated(paginationRequest).subscribe((transactions) => {
        expect(transactions).toEqual([]);
      });

      const req = httpMock.expectOne(
        `/api/transactions/${encodeURIComponent(paginationRequest.walletAddress)}`
      );
      req.flush([]);
    });

    it('should handle pagination with zero pageSize', () => {
      const paginationRequest: PaginationRequest = {
        walletAddress: 'wallet-123',
        page: 1,
        pageSize: 0,
      };

      service.getTransactionsPaginated(paginationRequest).subscribe();

      const req = httpMock.expectOne(
        `/api/transactions/${encodeURIComponent(paginationRequest.walletAddress)}`
      );
      req.flush([]);
    });

    it('should handle pagination with large pageSize', () => {
      const paginationRequest: PaginationRequest = {
        walletAddress: 'wallet-123',
        page: 1,
        pageSize: 1000,
      };

      service.getTransactionsPaginated(paginationRequest).subscribe();

      const req = httpMock.expectOne(
        `/api/transactions/${encodeURIComponent(paginationRequest.walletAddress)}`
      );
      req.flush(mockTransactions);
    });

    it('should handle malformed pagination request', () => {
      const paginationRequest: PaginationRequest = {
        walletAddress: '',
        page: -1,
        pageSize: -5,
      };

      service.getTransactionsPaginated(paginationRequest).subscribe();

      const req = httpMock.expectOne('/api/transactions/');
      req.flush([]);
    });
  });

  describe('loadMoreTransactions', () => {
    it('should load more transactions with same logic as paginated', () => {
      const paginationRequest: PaginationRequest = {
        walletAddress: 'wallet-123',
        page: 2,
        pageSize: 5,
      };

      service.loadMoreTransactions(paginationRequest).subscribe((transactions) => {
        expect(transactions).toEqual(mockTransactions);
      });

      const req = httpMock.expectOne(
        `/api/transactions/${encodeURIComponent(paginationRequest.walletAddress)}`
      );
      req.flush(mockTransactions);
    });

    it('should handle consecutive load more requests', () => {
      const request1: PaginationRequest = {
        walletAddress: 'wallet-123',
        page: 1,
        pageSize: 2,
      };

      const request2: PaginationRequest = {
        walletAddress: 'wallet-123',
        page: 2,
        pageSize: 2,
      };

      service.loadMoreTransactions(request1).subscribe();
      const req1 = httpMock.expectOne(
        `/api/transactions/${encodeURIComponent(request1.walletAddress)}`
      );
      req1.flush(mockTransactions.slice(0, 2));

      service.loadMoreTransactions(request2).subscribe();
      const req2 = httpMock.expectOne(
        `/api/transactions/${encodeURIComponent(request2.walletAddress)}`
      );
      req2.flush(mockTransactions.slice(2));
    });

    it('should handle load more with no additional transactions', () => {
      const paginationRequest: PaginationRequest = {
        walletAddress: 'wallet-123',
        page: 10,
        pageSize: 10,
      };

      service.loadMoreTransactions(paginationRequest).subscribe((transactions) => {
        expect(transactions).toEqual([]);
        expect(transactions.length).toBe(0);
      });

      const req = httpMock.expectOne(
        `/api/transactions/${encodeURIComponent(paginationRequest.walletAddress)}`
      );
      req.flush([]);
    });

    it('should handle load more API errors', () => {
      const paginationRequest: PaginationRequest = {
        walletAddress: 'wallet-123',
        page: 2,
        pageSize: 10,
      };

      service.loadMoreTransactions(paginationRequest).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        },
      });

      const req = httpMock.expectOne(
        `/api/transactions/${encodeURIComponent(paginationRequest.walletAddress)}`
      );
      req.flush('Server timeout', { status: 504, statusText: 'Gateway Timeout' });
    });
  });

  describe('edge cases and performance', () => {
    it('should handle very long wallet addresses', () => {
      const longWalletAddress = 'wallet-' + 'a'.repeat(1000);

      service.getTransactions(longWalletAddress).subscribe();

      const req = httpMock.expectOne(`/api/transactions/${encodeURIComponent(longWalletAddress)}`);
      req.flush(mockTransactions);
    });

    it('should handle wallet addresses with Unicode characters', () => {
      const unicodeWalletAddress = 'wallet-ñàmé-测试-🔑';

      service.getTransactions(unicodeWalletAddress).subscribe();

      const req = httpMock.expectOne(
        `/api/transactions/${encodeURIComponent(unicodeWalletAddress)}`
      );
      req.flush(mockTransactions);
    });

    it('should handle concurrent transaction requests', () => {
      const wallet1 = 'wallet-1';
      const wallet2 = 'wallet-2';

      service.getTransactions(wallet1).subscribe();
      service.getTransactions(wallet2).subscribe();

      const reqs = httpMock.match((req) => req.url.includes('/api/transactions/'));
      expect(reqs.length).toBe(2);

      reqs[0].flush(mockTransactions.slice(0, 1));
      reqs[1].flush(mockTransactions.slice(1, 2));
    });

    it('should handle large transaction datasets', () => {
      const largeTransactionSet = Array.from({ length: 1000 }, (_, i) => ({
        ...mockTransactions[0],
        id: `tx-${i}`,
        amount: i * 10,
      }));

      service.getTransactions('large-wallet').subscribe((transactions) => {
        expect(transactions.length).toBe(1000);
        expect(transactions[0].id).toBe('tx-0');
        expect(transactions[999].id).toBe('tx-999');
      });

      const req = httpMock.expectOne('/api/transactions/large-wallet');
      req.flush(largeTransactionSet);
    });

    it('should handle transactions with various transaction types and directions', () => {
      const variousTransactions = [
        {
          ...mockTransactions[0],
          transactionType: 'deposit' as const,
          direction: 'credit' as const,
        },
        {
          ...mockTransactions[1],
          transactionType: 'transfer' as const,
          direction: 'debit' as const,
        },
        {
          ...mockTransactions[2],
          transactionType: 'transfer' as const,
          direction: 'credit' as const,
        },
        {
          ...mockTransactions[0],
          id: 'tx-4',
          transactionType: 'deposit' as const,
          direction: 'credit' as const,
        },
      ];

      service.getTransactions('variety-wallet').subscribe((transactions) => {
        const types = transactions.map((tx) => tx.transactionType);
        const directions = transactions.map((tx) => tx.direction);
        expect(types).toContain('deposit');
        expect(types).toContain('transfer');
        expect(directions).toContain('credit');
        expect(directions).toContain('debit');
      });

      const req = httpMock.expectOne('/api/transactions/variety-wallet');
      req.flush(variousTransactions);
    });

    it('should handle transactions with different currencies', () => {
      const multiCurrencyTransactions = [
        { ...mockTransactions[0], currency: 'USD' },
        { ...mockTransactions[1], currency: 'EUR' },
        { ...mockTransactions[2], currency: 'NGN' },
        { ...mockTransactions[0], id: 'tx-4', currency: 'GBP' },
        { ...mockTransactions[1], id: 'tx-5', currency: 'BTC' },
      ];

      service.getTransactions('multi-currency-wallet').subscribe((transactions) => {
        const currencies = transactions.map((tx) => tx.currency);
        expect(currencies).toContain('USD');
        expect(currencies).toContain('EUR');
        expect(currencies).toContain('NGN');
        expect(currencies).toContain('GBP');
        expect(currencies).toContain('BTC');
      });

      const req = httpMock.expectOne('/api/transactions/multi-currency-wallet');
      req.flush(multiCurrencyTransactions);
    });
  });
});
