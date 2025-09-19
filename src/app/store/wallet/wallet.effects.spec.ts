import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Store } from '@ngrx/store';
import { Observable, of, throwError } from 'rxjs';
import { Action } from '@ngrx/store';

import { WalletEffects } from './wallet.effects';
import { WalletService } from '../../core/services/wallet.service';
import * as WalletActions from './wallet.actions';
import * as UserActions from '../user/user.actions';
import { WalletModel } from '../../core/models/wallet.model';

describe('WalletEffects', () => {
  let effects: WalletEffects;
  let actions$: Observable<Action>;
  let walletService: jasmine.SpyObj<WalletService>;
  let store: jasmine.SpyObj<Store>;

  const mockWallet: WalletModel = {
    id: '1',
    walletAddress: 'test-address',
    userId: 'user-1',
    balance: {
      USD: 1000,
      EUR: 800,
      GBP: 600,
      JPY: 50000,
      NGN: 100000,
      CAD: 1200,
      GHS: 5000,
      BTC: 0.5
    }
  };

  const mockCreateWalletResponse = {
    user: { email: 'test@example.com' },
    wallet: mockWallet,
    message: 'Wallet created successfully'
  };

  const mockDepositResponse = {
    success: true,
    wallet: mockWallet,
    message: 'Deposit successful'
  };

  const mockTransferResponse = {
    success: true,
    senderWallet: mockWallet,
    receiverWallet: mockWallet,
    message: 'Transfer successful'
  };

  const mockSwapResponse = {
    success: true,
    wallet: mockWallet,
    message: 'Swap successful'
  };

  beforeEach(() => {
    const walletServiceSpy = jasmine.createSpyObj('WalletService', [
      'createWallet',
      'getWallet', 
      'deposit',
      'transfer',
      'swap'
    ]);
    const storeSpy = jasmine.createSpyObj('Store', ['dispatch']);

    TestBed.configureTestingModule({
      providers: [
        WalletEffects,
        provideMockActions(() => actions$),
        { provide: WalletService, useValue: walletServiceSpy },
        { provide: Store, useValue: storeSpy }
      ]
    });

    effects = TestBed.inject(WalletEffects);
    walletService = TestBed.inject(WalletService) as jasmine.SpyObj<WalletService>;
    store = TestBed.inject(Store) as jasmine.SpyObj<Store>;
  });

  describe('createWallet$', () => {
    it('should return createWalletSuccess action on successful wallet creation', (done) => {
      const email = 'test@example.com';
      const action = WalletActions.createWallet({ email });

      walletService.createWallet.and.returnValue(of(mockCreateWalletResponse));

      actions$ = of(action);

      effects.createWallet$.subscribe((result) => {
        expect(result).toEqual(WalletActions.createWalletSuccess());
        expect(store.dispatch).toHaveBeenCalledWith(
          UserActions.setEmail({ email: 'test@example.com' })
        );
        done();
      });
    });

    it('should return createWalletFailure action on error', (done) => {
      const email = 'test@example.com';
      const action = WalletActions.createWallet({ email });
      const error = new Error('Network error');

      walletService.createWallet.and.returnValue(throwError(() => error));

      actions$ = of(action);

      effects.createWallet$.subscribe((result) => {
        expect(result).toEqual(
          WalletActions.createWalletFailure({ error: 'Network error' })
        );
        done();
      });
    });

    it('should return default error message when error has no message', (done) => {
      const email = 'test@example.com';
      const action = WalletActions.createWallet({ email });
      const error = {};

      walletService.createWallet.and.returnValue(throwError(() => error));

      actions$ = of(action);

      effects.createWallet$.subscribe((result) => {
        expect(result).toEqual(
          WalletActions.createWalletFailure({ error: 'Failed to create wallet' })
        );
        done();
      });
    });
  });

  describe('getWallet$', () => {
    it('should return getWalletSuccess action on successful wallet retrieval', (done) => {
      const email = 'test@example.com';
      const action = WalletActions.getWallet({ email });

      walletService.getWallet.and.returnValue(of(mockWallet));

      actions$ = of(action);

      effects.getWallet$.subscribe((result) => {
        expect(result).toEqual(
          WalletActions.getWalletSuccess({ wallet: mockWallet })
        );
        done();
      });
    });

    it('should return getWalletFailure action on error', (done) => {
      const email = 'test@example.com';
      const action = WalletActions.getWallet({ email });
      const error = new Error('Wallet not found');

      walletService.getWallet.and.returnValue(throwError(() => error));

      actions$ = of(action);

      effects.getWallet$.subscribe((result) => {
        expect(result).toEqual(
          WalletActions.getWalletFailure({ error: 'Wallet not found' })
        );
        done();
      });
    });

    it('should return default error message when error has no message', (done) => {
      const email = 'test@example.com';
      const action = WalletActions.getWallet({ email });
      const error = {};

      walletService.getWallet.and.returnValue(throwError(() => error));

      actions$ = of(action);

      effects.getWallet$.subscribe((result) => {
        expect(result).toEqual(
          WalletActions.getWalletFailure({ error: 'Failed to get wallet' })
        );
        done();
      });
    });
  });

  describe('deposit$', () => {
    it('should return depositSuccess action on successful deposit', (done) => {
      const depositData = {
        email: 'test@example.com',
        amount: 100,
        currency: 'USD'
      };
      const action = WalletActions.deposit(depositData);

      walletService.deposit.and.returnValue(of(mockDepositResponse));

      actions$ = of(action);

      effects.deposit$.subscribe((result) => {
        expect(result).toEqual(
          WalletActions.depositSuccess({
            wallet: mockWallet,
            message: 'Deposit successful'
          })
        );
        done();
      });
    });

    it('should return depositFailure action on error with error.error.error', (done) => {
      const depositData = {
        email: 'test@example.com',
        amount: 100,
        currency: 'USD'
      };
      const action = WalletActions.deposit(depositData);
      const error = { error: { error: 'Insufficient funds' } };

      walletService.deposit.and.returnValue(throwError(() => error));

      actions$ = of(action);

      effects.deposit$.subscribe((result) => {
        expect(result).toEqual(
          WalletActions.depositFailure({ error: 'Insufficient funds' })
        );
        done();
      });
    });

    it('should return depositFailure action on error with error.message', (done) => {
      const depositData = {
        email: 'test@example.com',
        amount: 100,
        currency: 'USD'
      };
      const action = WalletActions.deposit(depositData);
      const error = new Error('Network error');

      walletService.deposit.and.returnValue(throwError(() => error));

      actions$ = of(action);

      effects.deposit$.subscribe((result) => {
        expect(result).toEqual(
          WalletActions.depositFailure({ error: 'Network error' })
        );
        done();
      });
    });

    it('should return default error message when no specific error', (done) => {
      const depositData = {
        email: 'test@example.com',
        amount: 100,
        currency: 'USD'
      };
      const action = WalletActions.deposit(depositData);
      const error = {};

      walletService.deposit.and.returnValue(throwError(() => error));

      actions$ = of(action);

      effects.deposit$.subscribe((result) => {
        expect(result).toEqual(
          WalletActions.depositFailure({ error: 'Failed to process deposit' })
        );
        done();
      });
    });
  });

  describe('transfer$', () => {
    it('should return transferSuccess action on successful transfer', (done) => {
      const transferData = {
        fromEmail: 'sender@example.com',
        toWalletAddress: 'recipient-address',
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        convertedAmount: 85,
        exchangeRate: 0.85
      };
      const action = WalletActions.transfer(transferData);

      walletService.transfer.and.returnValue(of(mockTransferResponse));

      actions$ = of(action);

      effects.transfer$.subscribe((result) => {
        expect(result).toEqual(
          WalletActions.transferSuccess({
            senderWallet: mockWallet,
            message: 'Transfer successful'
          })
        );
        done();
      });
    });

    it('should return transferFailure action on error with error.error.error', (done) => {
      const transferData = {
        fromEmail: 'sender@example.com',
        toWalletAddress: 'recipient-address',
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        convertedAmount: 85,
        exchangeRate: 0.85
      };
      const action = WalletActions.transfer(transferData);
      const error = { error: { error: 'Insufficient balance' } };

      walletService.transfer.and.returnValue(throwError(() => error));

      actions$ = of(action);

      effects.transfer$.subscribe((result) => {
        expect(result).toEqual(
          WalletActions.transferFailure({ error: 'Insufficient balance' })
        );
        done();
      });
    });

    it('should return transferFailure action on error with error.message', (done) => {
      const transferData = {
        fromEmail: 'sender@example.com',
        toWalletAddress: 'recipient-address',
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        convertedAmount: 85,
        exchangeRate: 0.85
      };
      const action = WalletActions.transfer(transferData);
      const error = new Error('Network error');

      walletService.transfer.and.returnValue(throwError(() => error));

      actions$ = of(action);

      effects.transfer$.subscribe((result) => {
        expect(result).toEqual(
          WalletActions.transferFailure({ error: 'Network error' })
        );
        done();
      });
    });

    it('should return default error message when no specific error', (done) => {
      const transferData = {
        fromEmail: 'sender@example.com',
        toWalletAddress: 'recipient-address',
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        convertedAmount: 85,
        exchangeRate: 0.85
      };
      const action = WalletActions.transfer(transferData);
      const error = {};

      walletService.transfer.and.returnValue(throwError(() => error));

      actions$ = of(action);

      effects.transfer$.subscribe((result) => {
        expect(result).toEqual(
          WalletActions.transferFailure({ error: 'Failed to process transfer' })
        );
        done();
      });
    });
  });

  describe('swap$', () => {
    it('should return swapSuccess action on successful swap', (done) => {
      const swapData = {
        fromEmail: 'user@example.com',
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        convertedAmount: 85,
        exchangeRate: 0.85
      };
      const action = WalletActions.swap(swapData);

      walletService.swap.and.returnValue(of(mockSwapResponse));

      actions$ = of(action);

      effects.swap$.subscribe((result) => {
        expect(result).toEqual(
          WalletActions.swapSuccess({
            wallet: mockWallet,
            message: 'Swap successful'
          })
        );
        done();
      });
    });

    it('should return swapFailure action on error with error.error.error', (done) => {
      const swapData = {
        fromEmail: 'user@example.com',
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        convertedAmount: 85,
        exchangeRate: 0.85
      };
      const action = WalletActions.swap(swapData);
      const error = { error: { error: 'Insufficient balance' } };

      walletService.swap.and.returnValue(throwError(() => error));

      actions$ = of(action);

      effects.swap$.subscribe((result) => {
        expect(result).toEqual(
          WalletActions.swapFailure({ error: 'Insufficient balance' })
        );
        done();
      });
    });

    it('should return swapFailure action on error with error.message', (done) => {
      const swapData = {
        fromEmail: 'user@example.com',
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        convertedAmount: 85,
        exchangeRate: 0.85
      };
      const action = WalletActions.swap(swapData);
      const error = new Error('Network error');

      walletService.swap.and.returnValue(throwError(() => error));

      actions$ = of(action);

      effects.swap$.subscribe((result) => {
        expect(result).toEqual(
          WalletActions.swapFailure({ error: 'Network error' })
        );
        done();
      });
    });

    it('should return default error message when no specific error', (done) => {
      const swapData = {
        fromEmail: 'user@example.com',
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        convertedAmount: 85,
        exchangeRate: 0.85
      };
      const action = WalletActions.swap(swapData);
      const error = {};

      walletService.swap.and.returnValue(throwError(() => error));

      actions$ = of(action);

      effects.swap$.subscribe((result) => {
        expect(result).toEqual(
          WalletActions.swapFailure({ error: 'Failed to process swap' })
        );
        done();
      });
    });

    it('should call walletService.swap with correct parameters', (done) => {
      const swapData = {
        fromEmail: 'user@example.com',
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        convertedAmount: 85,
        exchangeRate: 0.85
      };
      const action = WalletActions.swap(swapData);

      walletService.swap.and.returnValue(of(mockSwapResponse));

      actions$ = of(action);

      effects.swap$.subscribe(() => {
        expect(walletService.swap).toHaveBeenCalledWith({
          fromEmail: 'user@example.com',
          amount: 100,
          fromCurrency: 'USD',
          toCurrency: 'EUR',
          convertedAmount: 85,
          exchangeRate: 0.85
        });
        done();
      });
    });
  });
});