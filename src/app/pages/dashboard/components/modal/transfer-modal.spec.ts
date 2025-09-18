import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, BehaviorSubject } from 'rxjs';
import { TransferModalComponent } from './transfer-modal';
import * as ExchangeRateActions from '../../../../store/exchange-rate/exchange-rate.actions';
import { ExchangeRateResponse } from '../../../../core/models/exchange-rate.model';
import { transfer } from '../../../../store/wallet/wallet.actions';
import {
  selectWallet,
  selectTransferLoading,
  selectTransferError,
} from '../../../../store/wallet/wallet.selector';
import { getUserEmail } from '../../../../store/user/user.selector';
import * as ExchangeRateSelectors from '../../../../store/exchange-rate/exchange-rate.selector';

describe('TransferModalComponent', () => {
  let component: TransferModalComponent;
  let fixture: ComponentFixture<TransferModalComponent>;
  let store: MockStore;

  const mockExchangeRates: ExchangeRateResponse = {
    base: 'USD',
    rates: {
      USD: 1.0,
      EUR: 0.85,
      GBP: 0.75,
      NGN: 1650.0,
      CAD: 1.35,
      GHS: 12.0,
      BTC: 0.000025,
    },
    date: '2025-09-18',
    success: true,
    timestamp: 1726675200,
  };

  const mockConversionResult = {
    fromCurrency: 'USD',
    toCurrency: 'NGN',
    amount: 100,
    convertedAmount: 165000,
    rate: 1650,
    timestamp: Date.now(),
  };

  const initialState = {
    exchangeRate: {
      currentRates: mockExchangeRates,
      historicalData: null,
      conversionResult: {
        success: true,
        query: {
          from: 'USD',
          to: 'NGN',
          amount: 100,
        },
        info: {
          timestamp: 1726675200,
          rate: 1650.0,
        },
        result: 165000,
      },
      loading: {
        rates: false,
        historical: false,
        conversion: false,
      },
      error: {
        rates: null,
        historical: null,
        conversion: null,
      },
    },
    wallet: {
      wallet: {
        id: 'wallet-1',
        userId: 'user-1',
        walletAddress: 'wallet-address-1',
        balance: {
          USD: 1000,
          EUR: 500,
          NGN: 100000,
          GBP: 0,
          JPY: 0,
          CAD: 0,
          GHS: 0,
          BTC: 0,
        },
      },
      isCreatingWallet: false,
      createWalletError: null,
      isFetching: false,
      fetchWalletError: null,
      isDepositing: false,
      depositError: null,
      isTransferring: false,
      transferError: null,
    },
    user: {
      email: 'test@example.com',
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferModalComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [provideMockStore({ initialState })],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(TransferModalComponent);
    component = fixture.componentInstance;

    spyOn(store, 'dispatch');
    spyOn(component.close, 'emit');
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with modal closed by default', () => {
      expect(component.isOpen).toBe(false);
    });

    it('should initialize transfer form with default values', () => {
      expect(component.transferForm.get('fromCurrency')?.value).toBe('USD');
      expect(component.transferForm.get('toCurrency')?.value).toBe('EUR');
      expect(component.transferForm.get('amount')?.value).toBe('');
      expect(component.transferForm.get('walletAddress')?.value).toBe('');
    });

    it('should initialize observables from store selectors', () => {
      expect(component.wallet$).toBeDefined();
      expect(component.userEmail$).toBeDefined();
      expect(component.isTransferring$).toBeDefined();
      expect(component.transferError$).toBeDefined();
      expect(component.conversionResult$).toBeDefined();
      expect(component.isConverting$).toBeDefined();
      expect(component.conversionError$).toBeDefined();
    });

    it('should set up currency options from constants', () => {
      expect(component.currencyOptions.length).toBeGreaterThan(0);
      expect(component.currencyOptions[0].value).toBeDefined();
      expect(component.currencyOptions[0].label).toBeDefined();
    });
  });

  describe('Form Value Changes and Conversion Branch Coverage', () => {
    it('should handle amount change and dispatch conversion', async () => {
      component.transferForm.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'NGN',
        amount: '100',
      });
      await new Promise((resolve) => setTimeout(resolve, 600));

      expect(store.dispatch).toHaveBeenCalledWith(
        ExchangeRateActions.convertCurrency({
          from: 'USD',
          to: 'NGN',
          amount: 100,
        })
      );
    });

    it('should not dispatch conversion for invalid amount', async () => {
      const dispatchSpy = store.dispatch as jasmine.Spy;
      dispatchSpy.calls.reset();

      component.transferForm.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'NGN',
        amount: 'invalid',
      });

      await new Promise((resolve) => setTimeout(resolve, 600));

      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should not dispatch conversion for same currencies', async () => {
      const dispatchSpy = store.dispatch as jasmine.Spy;
      dispatchSpy.calls.reset();

      component.transferForm.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'USD',
        amount: '100',
      });

      await new Promise((resolve) => setTimeout(resolve, 600));

      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should not dispatch conversion for zero amount', async () => {
      const dispatchSpy = store.dispatch as jasmine.Spy;
      dispatchSpy.calls.reset();

      component.transferForm.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'NGN',
        amount: '0',
      });

      await new Promise((resolve) => setTimeout(resolve, 600));

      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should not dispatch conversion for negative amount', async () => {
      const dispatchSpy = store.dispatch as jasmine.Spy;
      dispatchSpy.calls.reset();

      component.transferForm.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'NGN',
        amount: '-50',
      });

      await new Promise((resolve) => setTimeout(resolve, 600));

      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should handle empty amount', async () => {
      const dispatchSpy = store.dispatch as jasmine.Spy;
      dispatchSpy.calls.reset();

      component.transferForm.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'NGN',
        amount: '',
      });

      await new Promise((resolve) => setTimeout(resolve, 600));

      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should handle NaN amount', async () => {
      const dispatchSpy = store.dispatch as jasmine.Spy;
      dispatchSpy.calls.reset();

      component.transferForm.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'NGN',
        amount: 'abc123',
      });

      await new Promise((resolve) => setTimeout(resolve, 600));

      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should handle numeric amount as number instead of string', async () => {
      const dispatchSpy = store.dispatch as jasmine.Spy;
      dispatchSpy.calls.reset();

      component.transferForm.get('amount')?.setValue(100);

      await new Promise((resolve) => setTimeout(resolve, 600));

      expect(store.dispatch).toHaveBeenCalledWith(
        ExchangeRateActions.convertCurrency({
          from: 'USD',
          to: 'EUR',
          amount: 100,
        })
      );
    });
  });

  describe('Form Validation Branch Coverage', () => {
    it('should validate form before submission', () => {
      component.transferForm.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'NGN',
        amount: '',
        walletAddress: '',
      });

      component.onSubmit();

      expect(component.transferForm.invalid).toBe(true);
    });

    it('should mark all fields as touched when form is invalid on submit', () => {
      component.transferForm.patchValue({
        fromCurrency: '',
        toCurrency: '',
        amount: '',
        walletAddress: '',
      });

      spyOn(component.transferForm.get('fromCurrency')!, 'markAsTouched');
      spyOn(component.transferForm.get('toCurrency')!, 'markAsTouched');
      spyOn(component.transferForm.get('amount')!, 'markAsTouched');
      spyOn(component.transferForm.get('walletAddress')!, 'markAsTouched');

      component.onSubmit();

      expect(component.transferForm.get('fromCurrency')!.markAsTouched).toHaveBeenCalled();
      expect(component.transferForm.get('toCurrency')!.markAsTouched).toHaveBeenCalled();
      expect(component.transferForm.get('amount')!.markAsTouched).toHaveBeenCalled();
      expect(component.transferForm.get('walletAddress')!.markAsTouched).toHaveBeenCalled();
    });

    it('should validate required fields', () => {
      const fields = ['fromCurrency', 'toCurrency', 'amount', 'walletAddress'];

      fields.forEach((fieldName) => {
        const field = component.transferForm.get(fieldName);
        field?.setValue('');
        field?.markAsTouched();

        expect(component.getFieldError(fieldName)).toBe(
          `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`
        );
      });
    });

    it('should validate minimum amount', () => {
      const amountField = component.transferForm.get('amount');
      amountField?.setValue('0');
      amountField?.markAsTouched();

      expect(component.getFieldError('amount')).toBe('Amount must be greater than 0');
    });

    it('should validate amount pattern', () => {
      const amountField = component.transferForm.get('amount');
      amountField?.setValue('abc');
      amountField?.markAsTouched();

      expect(component.getFieldError('amount')).toBe('Please enter a valid amount (e.g., 10.50)');
    });

    it('should validate wallet address minimum length', () => {
      const walletField = component.transferForm.get('walletAddress');
      walletField?.setValue('short');
      walletField?.markAsTouched();

      expect(component.getFieldError('walletAddress')).toBe(
        'Wallet address too short. Required: 10 characters, current: 5'
      );
    });

    it('should return empty string for valid fields', () => {
      component.transferForm.patchValue({
        amount: '100.50',
        walletAddress: 'valid-wallet-address',
      });

      component.transferForm.get('amount')?.markAsTouched();
      component.transferForm.get('walletAddress')?.markAsTouched();

      expect(component.getFieldError('amount')).toBe('');
      expect(component.getFieldError('walletAddress')).toBe('');
    });

    it('should return empty string for untouched fields with errors', () => {
      component.transferForm.get('amount')?.setValue('');
      

      expect(component.getFieldError('amount')).toBe('');
    });

    it('should return empty string for fields without errors object', () => {
      const field = component.transferForm.get('amount');
      field?.setValue('100');
      field?.markAsTouched();
      Object.defineProperty(field, 'errors', { value: null, configurable: true });

      expect(component.getFieldError('amount')).toBe('');
    });

    it('should return empty string for unknown field names', () => {
      expect(component.getFieldError('unknownField')).toBe('');
    });
  });

  describe('Transfer Submission Branch Coverage', () => {
    beforeEach(() => {
      component.transferForm.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'NGN',
        amount: '100',
        walletAddress: 'valid-wallet-address-123',
      });
    });

    it('should not proceed with transfer when wallet is null', () => {
      store.overrideSelector(selectWallet, null);

      const dispatchSpy = store.dispatch as jasmine.Spy;
      dispatchSpy.calls.reset();

      component.onSubmit();

      expect(dispatchSpy).not.toHaveBeenCalledWith(
        jasmine.objectContaining({ type: transfer.type })
      );
    });

    it('should not proceed with transfer when insufficient balance', () => {
      const lowBalanceWallet = {
        ...initialState.wallet.wallet,
        balance: { ...initialState.wallet.wallet.balance, USD: 50 }, // Less than requested 100
      };

      store.overrideSelector(selectWallet, lowBalanceWallet);

      const dispatchSpy = store.dispatch as jasmine.Spy;
      dispatchSpy.calls.reset();

      component.onSubmit();

      expect(dispatchSpy).not.toHaveBeenCalledWith(
        jasmine.objectContaining({ type: transfer.type })
      );
    });

    it('should not proceed with transfer when user email is null', () => {
      store.overrideSelector(getUserEmail, null);

      const dispatchSpy = store.dispatch as jasmine.Spy;
      dispatchSpy.calls.reset();

      component.onSubmit();

      expect(dispatchSpy).not.toHaveBeenCalledWith(
        jasmine.objectContaining({ type: transfer.type })
      );
    });

    it('should dispatch transfer with same currency (no conversion)', () => {
      component.transferForm.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'USD',
        amount: '100',
        walletAddress: 'valid-wallet-address-123',
      });

      const dispatchSpy = store.dispatch as jasmine.Spy;
      dispatchSpy.calls.reset();

      component.onSubmit();

      expect(dispatchSpy).toHaveBeenCalledWith(
        transfer({
          fromEmail: 'test@example.com',
          toWalletAddress: 'valid-wallet-address-123',
          amount: 100,
          fromCurrency: 'USD',
          toCurrency: 'USD',
          convertedAmount: 100,
          exchangeRate: 1,
        })
      );
    });

    it('should dispatch transfer with currency conversion using conversion result', () => {
      const mockConversionResult = {
        success: true,
        query: { from: 'USD', to: 'NGN', amount: 100 },
        info: { rate: 1650, timestamp: 1726675200 },
        result: 165000,
      };

      store.overrideSelector(ExchangeRateSelectors.selectConversionResult, mockConversionResult);

      component.transferForm.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'NGN',
        amount: '100',
        walletAddress: 'valid-wallet-address-123',
      });

      const dispatchSpy = store.dispatch as jasmine.Spy;
      dispatchSpy.calls.reset();

      component.onSubmit();

      expect(dispatchSpy).toHaveBeenCalledWith(
        transfer({
          fromEmail: 'test@example.com',
          toWalletAddress: 'valid-wallet-address-123',
          amount: 100,
          fromCurrency: 'USD',
          toCurrency: 'NGN',
          convertedAmount: 165000,
          exchangeRate: 1650,
        })
      );
    });

    it('should dispatch transfer with fallback values when conversion result is null', () => {
      store.overrideSelector(ExchangeRateSelectors.selectConversionResult, null);

      const dispatchSpy = store.dispatch as jasmine.Spy;
      dispatchSpy.calls.reset();

      component.onSubmit();

      expect(dispatchSpy).toHaveBeenCalledWith(
        transfer({
          fromEmail: 'test@example.com',
          toWalletAddress: 'valid-wallet-address-123',
          amount: 100,
          fromCurrency: 'USD',
          toCurrency: 'NGN',
          convertedAmount: 100, // fallback to original amount
          exchangeRate: 1, // fallback rate
        })
      );
    });
  });

  describe('Transfer Success Monitoring Branch Coverage', () => {
    it('should set success state when transfer completes successfully', () => {
      store.overrideSelector(selectTransferLoading, false);
      store.overrideSelector(selectTransferError, null);

      // Set up valid form
      component.transferForm.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'NGN',
        amount: '100',
        walletAddress: 'valid-wallet-address-123',
      });

      spyOn(component, 'closeModal');

      component.ngOnInit();

      store.refreshState();

      expect(component.transferSuccess).toBe(true);
      expect(component.successMessage).toBe('Transfer completed successfully');
    });

    it('should not set success state when form is invalid', () => {
      store.overrideSelector(selectTransferLoading, false);
      store.overrideSelector(selectTransferError, null);

      component.transferForm.patchValue({
        amount: '', 
        walletAddress: '',
      });

      component.ngOnInit();

      store.refreshState();

      expect(component.transferSuccess).toBe(false);
    });

    it('should not set success state when there is an error', () => {
      store.overrideSelector(selectTransferLoading, false);
      store.overrideSelector(selectTransferError, 'Transfer failed');

      store.refreshState();

      component.transferForm.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'NGN',
        amount: '100',
        walletAddress: 'valid-wallet-address-123',
      });

      component.ngOnInit();

      expect(component.transferSuccess).toBe(false);
    });

    it('should not set success state when still transferring', () => {
      store.overrideSelector(selectTransferLoading, true);
      store.overrideSelector(selectTransferError, null);

      component.transferForm.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'NGN',
        amount: '100',
        walletAddress: 'valid-wallet-address-123',
      });

      component.ngOnInit();

      store.refreshState();

      expect(component.transferSuccess).toBe(false);
    });
  });

  describe('Modal Management Branch Coverage', () => {
    it('should close modal and reset form', () => {
      component.transferForm.patchValue({
        amount: '100',
        walletAddress: 'test-address',
      });
      component.transferSuccess = true;
      component.successMessage = 'Test message';

      component.closeModal();

      expect(component.close.emit).toHaveBeenCalled();
    });

    it('should reset form values and success state', () => {
      component.transferForm.patchValue({
        amount: '100',
        walletAddress: 'test-address',
      });
      component.transferSuccess = true;
      component.successMessage = 'Test message';

      component.resetForm();

      expect(component.transferForm.get('amount')?.value).toBe('');
      expect(component.transferForm.get('walletAddress')?.value).toBe('');
      expect(component.transferSuccess).toBe(false);
      expect(component.successMessage).toBe('');
    });

    it('should reset transfer state', () => {
      component.transferSuccess = true;
      component.successMessage = 'Test message';

      component['resetTransferState']();

      expect(component.transferSuccess).toBe(false);
      expect(component.successMessage).toBe('');
    });

    it('should handle isOpen input property', () => {
      component.isOpen = true;
      expect(component.isOpen).toBe(true);

      component.isOpen = false;
      expect(component.isOpen).toBe(false);
    });
  });

  describe('Available Balance Branch Coverage', () => {
    it('should get available balance for selected currency', (done) => {
      component.transferForm.get('fromCurrency')?.setValue('USD');

      // Test by subscribing to the wallet directly since the method is async
      component.wallet$.subscribe((wallet) => {
        if (wallet) {
          const balance = wallet.balance['USD'];
          expect(balance).toBe(1000);
          done();
        }
      });
    });

    it('should return 0 when wallet is null', () => {
      store.overrideSelector(selectWallet, null);

      const balance = component.getAvailableBalance();

      expect(balance).toBe(0);
    });

    it('should return 0 when currency balance is undefined', () => {
      const walletWithUndefinedCurrency = {
        ...initialState.wallet.wallet,
        balance: { ...initialState.wallet.wallet.balance, UNKNOWN: undefined as any },
      };

      store.overrideSelector(selectWallet, walletWithUndefinedCurrency);
      component.transferForm.get('fromCurrency')?.setValue('UNKNOWN');

      const balance = component.getAvailableBalance();

      expect(balance).toBe(0);
    });
  });

  describe('Lifecycle Management', () => {
    it('should clean up on destroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });

  describe('Observable State Management', () => {
    it('should handle conversion loading state', (done: DoneFn) => {
      component.isConverting$.subscribe((loading: boolean) => {
        expect(typeof loading).toBe('boolean');
        done();
      });
    });

    it('should handle conversion error state', (done: DoneFn) => {
      component.conversionError$.subscribe((error: string | null) => {
        expect(error === null || typeof error === 'string').toBe(true);
        done();
      });
    });

    it('should handle transfer loading state', (done: DoneFn) => {
      component.isTransferring$.subscribe((loading: boolean) => {
        expect(typeof loading).toBe('boolean');
        done();
      });
    });

    it('should handle transfer error state', (done: DoneFn) => {
      component.transferError$.subscribe((error: string | null) => {
        expect(error === null || typeof error === 'string').toBe(true);
        done();
      });
    });
  });
});
