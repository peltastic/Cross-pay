import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import {
  WalletService,
  DepositRequest,
  DepositResponse,
  TransferRequest,
  TransferResponse,
  SwapRequest,
  SwapResponse,
} from './wallet.service';
import { WalletModel } from '../models/wallet.model';
import { UserModel } from '../models/user.model';

describe('WalletService', () => {
  let service: WalletService;
  let httpMock: HttpTestingController;

  const mockUser: UserModel = {
    email: 'john.doe@example.com',
  };

  const mockWallet: WalletModel = {
    id: 'wallet-1',
    userId: '1',
    walletAddress: 'wallet-address-123',
    balance: {
      USD: 1000,
      EUR: 850,
      GBP: 750,
      NGN: 450000,
      JPY: 150000,
      CAD: 1200,
      GHS: 5000,
      BTC: 0.05,
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WalletService],
    });

    service = TestBed.inject(WalletService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createWallet', () => {
    it('should create a new wallet for user', () => {
      const email = 'test@example.com';
      const expectedResponse = { user: mockUser, wallet: mockWallet };

      service.createWallet(email).subscribe((response) => {
        expect(response).toEqual(expectedResponse);
        expect(response.user.email).toBe(mockUser.email);
        expect(response.wallet.id).toBe(mockWallet.id);
      });

      const req = httpMock.expectOne('/api/create/wallet');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ user: email });
      req.flush(expectedResponse);
    });

    it('should handle email with special characters', () => {
      const email = 'test+user@example.com';
      const expectedResponse = { user: { ...mockUser, email }, wallet: mockWallet };

      service.createWallet(email).subscribe((response) => {
        expect(response.user.email).toBe(email);
      });

      const req = httpMock.expectOne('/api/create/wallet');
      expect(req.request.body).toEqual({ user: email });
      req.flush(expectedResponse);
    });

    it('should handle HTTP errors when creating wallet', () => {
      const email = 'test@example.com';

      service.createWallet(email).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        },
      });

      const req = httpMock.expectOne('/api/create/wallet');
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle empty email', () => {
      const email = '';

      service.createWallet(email).subscribe();

      const req = httpMock.expectOne('/api/create/wallet');
      expect(req.request.body).toEqual({ user: '' });
      req.flush({ user: mockUser, wallet: mockWallet });
    });
  });

  describe('getWallet', () => {
    it('should fetch wallet by email', () => {
      const email = 'test@example.com';

      service.getWallet(email).subscribe((wallet) => {
        expect(wallet).toEqual(mockWallet);
        expect(wallet.id).toBe(mockWallet.id);
        expect(wallet.balance.USD).toBe(1000);
      });

      const expectedUrl = `/api/wallet/${encodeURIComponent(email)}`;
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockWallet);
    });

    it('should encode special characters in email for URL', () => {
      const email = 'test+user@example.com';

      service.getWallet(email).subscribe();

      const expectedUrl = `/api/wallet/${encodeURIComponent(email)}`;
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.url).toBe(expectedUrl);
      req.flush(mockWallet);
    });

    it('should handle email with spaces', () => {
      const email = 'test user@example.com';

      service.getWallet(email).subscribe((wallet) => {
        expect(wallet).toEqual(mockWallet);
      });

      const expectedUrl = `/api/wallet/${encodeURIComponent(email)}`;
      const req = httpMock.expectOne(expectedUrl);
      req.flush(mockWallet);
    });

    it('should handle wallet not found error', () => {
      const email = 'notfound@example.com';

      service.getWallet(email).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        },
      });

      const req = httpMock.expectOne(`/api/wallet/${encodeURIComponent(email)}`);
      req.flush('Wallet not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle network errors', () => {
      const email = 'test@example.com';

      service.getWallet(email).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        },
      });

      const req = httpMock.expectOne(`/api/wallet/${encodeURIComponent(email)}`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('deposit', () => {
    it('should make a successful deposit', () => {
      const depositRequest: DepositRequest = {
        email: 'test@example.com',
        amount: 500,
        currency: 'USD',
      };

      const expectedResponse: DepositResponse = {
        success: true,
        wallet: { ...mockWallet, balance: { ...mockWallet.balance, USD: 1500 } },
        message: 'Deposit successful',
      };

      service.deposit(depositRequest).subscribe((response) => {
        expect(response).toEqual(expectedResponse);
        expect(response.success).toBe(true);
        expect(response.wallet.balance.USD).toBe(1500);
        expect(response.message).toBe('Deposit successful');
      });

      const req = httpMock.expectOne('/api/deposit');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(depositRequest);
      req.flush(expectedResponse);
    });

    it('should handle zero amount deposit', () => {
      const depositRequest: DepositRequest = {
        email: 'test@example.com',
        amount: 0,
        currency: 'USD',
      };

      const expectedResponse: DepositResponse = {
        success: false,
        wallet: mockWallet,
        message: 'Invalid deposit amount',
      };

      service.deposit(depositRequest).subscribe((response) => {
        expect(response.success).toBe(false);
        expect(response.message).toBe('Invalid deposit amount');
      });

      const req = httpMock.expectOne('/api/deposit');
      req.flush(expectedResponse);
    });

    it('should handle negative amount deposit', () => {
      const depositRequest: DepositRequest = {
        email: 'test@example.com',
        amount: -100,
        currency: 'USD',
      };

      service.deposit(depositRequest).subscribe();

      const req = httpMock.expectOne('/api/deposit');
      expect(req.request.body.amount).toBe(-100);
      req.flush({ success: false, wallet: mockWallet, message: 'Invalid amount' });
    });

    it('should handle different currencies', () => {
      const currencies = ['USD', 'EUR', 'GBP', 'NGN', 'CAD', 'GHS', 'BTC'];

      currencies.forEach((currency) => {
        const depositRequest: DepositRequest = {
          email: 'test@example.com',
          amount: 100,
          currency,
        };

        service.deposit(depositRequest).subscribe();

        const req = httpMock.expectOne('/api/deposit');
        expect(req.request.body.currency).toBe(currency);
        req.flush({ success: true, wallet: mockWallet, message: 'Success' });
      });
    });

    it('should handle large deposit amounts', () => {
      const depositRequest: DepositRequest = {
        email: 'test@example.com',
        amount: Number.MAX_SAFE_INTEGER,
        currency: 'USD',
      };

      service.deposit(depositRequest).subscribe();

      const req = httpMock.expectOne('/api/deposit');
      expect(req.request.body.amount).toBe(Number.MAX_SAFE_INTEGER);
      req.flush({ success: true, wallet: mockWallet, message: 'Large deposit successful' });
    });

    it('should handle deposit API errors', () => {
      const depositRequest: DepositRequest = {
        email: 'test@example.com',
        amount: 500,
        currency: 'USD',
      };

      service.deposit(depositRequest).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        },
      });

      const req = httpMock.expectOne('/api/deposit');
      req.flush('Insufficient funds', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('transfer', () => {
    it('should make a successful transfer', () => {
      const transferRequest: TransferRequest = {
        fromEmail: 'sender@example.com',
        toWalletAddress: 'receiver-wallet-123',
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        convertedAmount: 85,
        exchangeRate: 0.85,
      };

      const expectedResponse: TransferResponse = {
        success: true,
        message: 'Transfer successful',
        senderWallet: { ...mockWallet, balance: { ...mockWallet.balance, USD: 900 } },
        receiverWallet: {
          ...mockWallet,
          id: 'wallet-2',
          balance: { ...mockWallet.balance, EUR: 935 },
        },
      };

      service.transfer(transferRequest).subscribe((response) => {
        expect(response).toEqual(expectedResponse);
        expect(response.success).toBe(true);
        expect(response.senderWallet.balance.USD).toBe(900);
        expect(response.receiverWallet.balance.EUR).toBe(935);
      });

      const req = httpMock.expectOne('/api/transfer');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(transferRequest);
      req.flush(expectedResponse);
    });

    it('should handle same currency transfer', () => {
      const transferRequest: TransferRequest = {
        fromEmail: 'sender@example.com',
        toWalletAddress: 'receiver-wallet-123',
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'USD',
        convertedAmount: 100,
        exchangeRate: 1.0,
      };

      service.transfer(transferRequest).subscribe((response) => {
        expect(response.success).toBe(true);
      });

      const req = httpMock.expectOne('/api/transfer');
      expect(req.request.body.exchangeRate).toBe(1.0);
      req.flush({
        success: true,
        message: 'Transfer successful',
        senderWallet: mockWallet,
        receiverWallet: mockWallet,
      });
    });

    it('should handle zero amount transfer', () => {
      const transferRequest: TransferRequest = {
        fromEmail: 'sender@example.com',
        toWalletAddress: 'receiver-wallet-123',
        amount: 0,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        convertedAmount: 0,
        exchangeRate: 0.85,
      };

      service.transfer(transferRequest).subscribe();

      const req = httpMock.expectOne('/api/transfer');
      expect(req.request.body.amount).toBe(0);
      req.flush({
        success: false,
        message: 'Invalid amount',
        senderWallet: mockWallet,
        receiverWallet: mockWallet,
      });
    });

    it('should handle transfer to same wallet', () => {
      const transferRequest: TransferRequest = {
        fromEmail: 'user@example.com',
        toWalletAddress: 'wallet-address-123', // Same as sender's wallet
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        convertedAmount: 85,
        exchangeRate: 0.85,
      };

      service.transfer(transferRequest).subscribe((result) => {
        expect(result.success).toBe(false);
        expect(result.message).toBe('Cannot transfer to same wallet');
      });

      const req = httpMock.expectOne('/api/transfer');
      req.flush({
        success: false,
        message: 'Cannot transfer to same wallet',
        senderWallet: mockWallet,
        receiverWallet: mockWallet,
      });
    });

    it('should handle invalid wallet address', () => {
      const transferRequest: TransferRequest = {
        fromEmail: 'sender@example.com',
        toWalletAddress: 'invalid-wallet',
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        convertedAmount: 85,
        exchangeRate: 0.85,
      };

      service.transfer(transferRequest).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        },
      });

      const req = httpMock.expectOne('/api/transfer');
      req.flush('Wallet not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle insufficient funds', () => {
      const transferRequest: TransferRequest = {
        fromEmail: 'sender@example.com',
        toWalletAddress: 'receiver-wallet-123',
        amount: 10000, // Amount exceeds balance
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        convertedAmount: 8500,
        exchangeRate: 0.85,
      };

      service.transfer(transferRequest).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        },
      });

      const req = httpMock.expectOne('/api/transfer');
      req.flush('Insufficient funds', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle extreme exchange rates', () => {
      const transferRequest: TransferRequest = {
        fromEmail: 'sender@example.com',
        toWalletAddress: 'receiver-wallet-123',
        amount: 1,
        fromCurrency: 'BTC',
        toCurrency: 'NGN',
        convertedAmount: 45000000, // Very high rate
        exchangeRate: 45000000,
      };

      service.transfer(transferRequest).subscribe();

      const req = httpMock.expectOne('/api/transfer');
      expect(req.request.body.exchangeRate).toBe(45000000);
      req.flush({
        success: true,
        message: 'Transfer successful',
        senderWallet: mockWallet,
        receiverWallet: mockWallet,
      });
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle malformed email addresses', () => {
      const malformedEmails = [
        '',
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
      ];

      malformedEmails.forEach((email) => {
        service.getWallet(email).subscribe((wallet) => {
          expect(wallet).toEqual(mockWallet);
        });
        const req = httpMock.expectOne(`/api/wallet/${encodeURIComponent(email)}`);
        req.flush(mockWallet);
      });
    });

    it('should handle concurrent requests', () => {
      const email1 = 'user1@example.com';
      const email2 = 'user2@example.com';

      service.getWallet(email1).subscribe();
      service.getWallet(email2).subscribe();

      const reqs = httpMock.match((req) => req.url.includes('/api/wallet/'));
      expect(reqs.length).toBe(2);

      reqs[0].flush(mockWallet);
      reqs[1].flush({ ...mockWallet, id: 'wallet-2' });
    });

    it('should handle very long email addresses', () => {
      const longEmail = 'a'.repeat(100) + '@example.com';

      service.getWallet(longEmail).subscribe(
        (wallet) => {
          expect(wallet).toEqual(mockWallet);
        }
      );

      const req = httpMock.expectOne(`/api/wallet/${encodeURIComponent(longEmail)}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockWallet);
    });
  });

  describe('swap', () => {
    it('should perform currency swap successfully', () => {
      const swapRequest: SwapRequest = {
        fromEmail: 'test@example.com',
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        convertedAmount: 85,
        exchangeRate: 0.85
      };

      const mockResponse: SwapResponse = {
        success: true,
        message: 'Swap completed successfully',
        wallet: {
          ...mockWallet,
          balance: {
            ...mockWallet.balance,
            USD: 900,
            EUR: 935
          }
        }
      };

      service.swap(swapRequest).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.success).toBe(true);
        expect(response.wallet.balance.USD).toBe(900);
        expect(response.wallet.balance.EUR).toBe(935);
      });

      const req = httpMock.expectOne('/api/swap');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(swapRequest);
      req.flush(mockResponse);
    });

    it('should handle same currency swap', () => {
      const swapRequest: SwapRequest = {
        fromEmail: 'test@example.com',
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'USD',
        convertedAmount: 100,
        exchangeRate: 1
      };

      const mockResponse: SwapResponse = {
        success: true,
        message: 'Swap completed successfully',
        wallet: mockWallet
      };

      service.swap(swapRequest).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.success).toBe(true);
      });

      const req = httpMock.expectOne('/api/swap');
      expect(req.request.body).toEqual(swapRequest);
      req.flush(mockResponse);
    });

    it('should handle swap with fractional amounts', () => {
      const swapRequest: SwapRequest = {
        fromEmail: 'test@example.com',
        amount: 99.99,
        fromCurrency: 'USD',
        toCurrency: 'GBP',
        convertedAmount: 79.99,
        exchangeRate: 0.8
      };

      const mockResponse: SwapResponse = {
        success: true,
        message: 'Swap completed successfully',
        wallet: {
          ...mockWallet,
          balance: {
            ...mockWallet.balance,
            USD: 900.01,
            GBP: 829.99
          }
        }
      };

      service.swap(swapRequest).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.wallet.balance.USD).toBe(900.01);
        expect(response.wallet.balance.GBP).toBe(829.99);
      });

      const req = httpMock.expectOne('/api/swap');
      expect(req.request.body.amount).toBe(99.99);
      expect(req.request.body.convertedAmount).toBe(79.99);
      req.flush(mockResponse);
    });

    it('should handle insufficient balance error', () => {
      const swapRequest: SwapRequest = {
        fromEmail: 'test@example.com',
        amount: 10000,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        convertedAmount: 8500,
        exchangeRate: 0.85
      };

      const errorResponse = {
        error: 'Insufficient balance',
        status: 400
      };

      service.swap(swapRequest).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne('/api/swap');
      req.flush(errorResponse, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle invalid currency error', () => {
      const swapRequest: SwapRequest = {
        fromEmail: 'test@example.com',
        amount: 100,
        fromCurrency: 'INVALID',
        toCurrency: 'EUR',
        convertedAmount: 85,
        exchangeRate: 0.85
      };

      service.swap(swapRequest).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne('/api/swap');
      req.flush('Invalid currency', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle network errors', () => {
      const swapRequest: SwapRequest = {
        fromEmail: 'test@example.com',
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        convertedAmount: 85,
        exchangeRate: 0.85
      };

      service.swap(swapRequest).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne('/api/swap');
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle zero amount swap', () => {
      const swapRequest: SwapRequest = {
        fromEmail: 'test@example.com',
        amount: 0,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        convertedAmount: 0,
        exchangeRate: 0.85
      };

      service.swap(swapRequest).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne('/api/swap');
      req.flush('Amount must be greater than 0', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle large amount swap', () => {
      const swapRequest: SwapRequest = {
        fromEmail: 'test@example.com',
        amount: 999999.99,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        convertedAmount: 849999.99,
        exchangeRate: 0.85
      };

      const mockResponse: SwapResponse = {
        success: true,
        message: 'Large swap completed successfully',
        wallet: {
          ...mockWallet,
          balance: {
            ...mockWallet.balance,
            USD: 1000 - 999999.99,
            EUR: 850 + 849999.99
          }
        }
      };

      service.swap(swapRequest).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.success).toBe(true);
      });

      const req = httpMock.expectOne('/api/swap');
      expect(req.request.body.amount).toBe(999999.99);
      req.flush(mockResponse);
    });

    it('should preserve request body structure', () => {
      const swapRequest: SwapRequest = {
        fromEmail: 'user@test.com',
        amount: 50.25,
        fromCurrency: 'GBP',
        toCurrency: 'JPY',
        convertedAmount: 7537.5,
        exchangeRate: 150
      };

      const mockResponse: SwapResponse = {
        success: true,
        message: 'Swap successful',
        wallet: mockWallet
      };

      service.swap(swapRequest).subscribe();

      const req = httpMock.expectOne('/api/swap');
      expect(req.request.body).toEqual({
        fromEmail: 'user@test.com',
        amount: 50.25,
        fromCurrency: 'GBP',
        toCurrency: 'JPY',
        convertedAmount: 7537.5,
        exchangeRate: 150
      });
      req.flush(mockResponse);
    });

    it('should handle empty email in swap request', () => {
      const swapRequest: SwapRequest = {
        fromEmail: '',
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        convertedAmount: 85,
        exchangeRate: 0.85
      };

      service.swap(swapRequest).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne('/api/swap');
      req.flush('Email is required', { status: 400, statusText: 'Bad Request' });
    });
  });
});
