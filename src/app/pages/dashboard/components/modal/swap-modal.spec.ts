import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ChangeDetectorRef } from '@angular/core';
import { of, throwError, BehaviorSubject } from 'rxjs';

import { SwapModalComponent } from './swap-modal';
import { ExchangeRateService } from '../../../../core/services/exchange-rate.service';
import { ConversionResult } from '../../../../core/models/exchange-rate.model';
import { WalletModel } from '../../../../core/models/wallet.model';
import * as WalletActions from '../../../../store/wallet/wallet.actions';
import * as ExchangeRateActions from '../../../../store/exchange-rate/exchange-rate.actions';
import { selectWallet } from '../../../../store/wallet/wallet.selector';
import { getUserEmail } from '../../../../store/user/user.selector';

describe('SwapModalComponent', () => {
  let component: SwapModalComponent;
  let fixture: ComponentFixture<SwapModalComponent>;
  let mockStore: jasmine.SpyObj<Store>;
  let mockExchangeRateService: jasmine.SpyObj<ExchangeRateService>;
  let mockCdr: jasmine.SpyObj<ChangeDetectorRef>;

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

  const mockConversionResult: ConversionResult = {
    success: true,
    query: { from: 'USD', to: 'EUR', amount: 100 },
    info: { timestamp: Date.now(), rate: 0.85 },
    result: 85
  };

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    const exchangeRateServiceSpy = jasmine.createSpyObj('ExchangeRateService', ['convertCurrency']);
    const cdrSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    await TestBed.configureTestingModule({
      imports: [SwapModalComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: Store, useValue: storeSpy },
        { provide: ExchangeRateService, useValue: exchangeRateServiceSpy },
        { provide: ChangeDetectorRef, useValue: cdrSpy }
      ]
    }).compileComponents();

    mockStore = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    mockExchangeRateService = TestBed.inject(ExchangeRateService) as jasmine.SpyObj<ExchangeRateService>;
    mockCdr = TestBed.inject(ChangeDetectorRef) as jasmine.SpyObj<ChangeDetectorRef>;

    setupMockStoreSelectors();
    
    fixture = TestBed.createComponent(SwapModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function setupMockStoreSelectors() {
    mockStore.select.and.callFake((selector: any) => {
      // Use direct selector comparison for more reliable mocking
      if (selector === selectWallet) {
        return of(mockWallet);
      }
      if (selector === getUserEmail) {
        return of('test@example.com');
      }
      // Fallback to string matching for other selectors
      if (selector.toString().includes('selectSwapLoading')) {
        return of(false);
      }
      if (selector.toString().includes('selectSwapError')) {
        return of(null);
      }
      if (selector.toString().includes('selectConversionLoading')) {
        return of(false);
      }
      if (selector.toString().includes('selectConversionError')) {
        return of(null);
      }
      if (selector.toString().includes('selectConversionResult')) {
        return of(mockConversionResult);
      }
      return of(null);
    });
  }

  describe('Component initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with default values', () => {
      expect(component.swapForm).toBeDefined();
      expect(component.swapForm.get('fromCurrency')?.value).toBe('USD');
      expect(component.swapForm.get('toCurrency')?.value).toBe('EUR');
      expect(component.swapForm.get('amount')?.value).toBe('');
    });

    it('should initialize currency options', () => {
      expect(component.currencyOptions).toBeDefined();
      expect(component.currencyOptions.length).toBeGreaterThan(0);
      expect(component.currencyOptions[0]).toEqual({ value: 'USD', label: 'USD' });
    });
  });

  describe('Form validation', () => {
    it('should require fromCurrency', () => {
      const fromCurrencyControl = component.swapForm.get('fromCurrency');
      fromCurrencyControl?.setValue('');
      fromCurrencyControl?.markAsTouched();
      
      expect(fromCurrencyControl?.valid).toBeFalsy();
      expect(fromCurrencyControl?.errors?.['required']).toBeTruthy();
    });

    it('should require toCurrency', () => {
      const toCurrencyControl = component.swapForm.get('toCurrency');
      toCurrencyControl?.setValue('');
      toCurrencyControl?.markAsTouched();
      
      expect(toCurrencyControl?.valid).toBeFalsy();
      expect(toCurrencyControl?.errors?.['required']).toBeTruthy();
    });

    it('should require amount', () => {
      const amountControl = component.swapForm.get('amount');
      amountControl?.setValue('');
      amountControl?.markAsTouched();
      
      expect(amountControl?.valid).toBeFalsy();
      expect(amountControl?.errors?.['required']).toBeTruthy();
    });

    it('should validate minimum amount', () => {
      const amountControl = component.swapForm.get('amount');
      amountControl?.setValue('0');
      amountControl?.markAsTouched();
      
      expect(amountControl?.valid).toBeFalsy();
      expect(amountControl?.errors?.['min']).toBeTruthy();
    });

    it('should validate amount pattern', () => {
      const amountControl = component.swapForm.get('amount');
      amountControl?.setValue('invalid');
      amountControl?.markAsTouched();
      
      expect(amountControl?.valid).toBeFalsy();
      expect(amountControl?.errors?.['pattern']).toBeTruthy();
    });

    it('should accept valid amount', fakeAsync(() => {
      // Ensure the wallet observable has emitted
      tick();
      fixture.detectChanges();
      
      const amountControl = component.swapForm.get('amount');
      amountControl?.setValue('100.50');
      
      tick(); // Let the validator run
      
      expect(amountControl?.valid).toBeTruthy();
    }));
  });

  describe('Error message handling', () => {
    it('should return required error message', () => {
      const amountControl = component.swapForm.get('amount');
      amountControl?.setValue('');
      amountControl?.markAsTouched();
      
      const errorMessage = component.getFieldError('amount');
      expect(errorMessage).toBe('Amount is required');
    });

    it('should return minimum amount error message', () => {
      const amountControl = component.swapForm.get('amount');
      amountControl?.setValue('0');
      amountControl?.markAsTouched();
      
      const errorMessage = component.getFieldError('amount');
      expect(errorMessage).toBe('Amount must be greater than 0');
    });

    it('should return pattern error message', () => {
      const amountControl = component.swapForm.get('amount');
      amountControl?.setValue('invalid');
      amountControl?.markAsTouched();
      
      const errorMessage = component.getFieldError('amount');
      expect(errorMessage).toBe('Please enter a valid amount (e.g., 10.50)');
    });
  });

  describe('Available balance', () => {
    beforeEach(() => {
      component.wallet$ = of(mockWallet);
      component.userEmail$ = of('test@example.com');
      component.conversionResult$ = of(mockConversionResult);
      fixture.detectChanges();
    });

    it('should return balance for selected currency', fakeAsync(() => {
      component.swapForm.get('fromCurrency')?.setValue('USD');
      tick();
      const balance = component.getAvailableBalance();
      expect(balance).toBe(1000);
    }));

    it('should return 0 when wallet is null', fakeAsync(() => {
      mockStore.select.and.callFake((selector: any) => {
        if (selector === selectWallet) {
          return of(null);
        }
        return of(null);
      });
      
      // Force recreation of component to pick up new mock
      fixture = TestBed.createComponent(SwapModalComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
      
      const balance = component.getAvailableBalance();
      expect(balance).toBe(0);
    }));

    it('should return 0 for unsupported currency', fakeAsync(() => {
      component.swapForm.get('fromCurrency')?.setValue('XYZ');
      tick();
      const balance = component.getAvailableBalance();
      expect(balance).toBe(0);
    }));
  });

  describe('Form submission', () => {
    beforeEach(() => {
      component.wallet$ = of(mockWallet);
      component.userEmail$ = of('test@example.com');
      component.conversionResult$ = of(mockConversionResult);
      fixture.detectChanges();
      component.swapForm.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: '100'
      });
    });

    it('should not submit invalid form', () => {
      component.swapForm.get('amount')?.setValue('');
      component.onSubmit();
      
      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });

    it('should dispatch swap action with valid form', fakeAsync(() => {
      component.onSubmit();
      tick();
      
      expect(mockStore.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({
        type: '[Wallet] Swap',
        fromEmail: 'test@example.com',
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR'
      }));
    }));

    it('should handle same currency swap', fakeAsync(() => {
      component.swapForm.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'USD',
        amount: '100'
      });
      component.onSubmit();
      tick();
      
      expect(mockStore.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({
        type: '[Wallet] Swap',
        fromEmail: 'test@example.com',
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'USD'
      }));
    }));

    it('should mark form controls as touched on invalid submit', () => {
      component.swapForm.get('amount')?.setValue('');
      spyOn(component.swapForm.get('amount')!, 'markAsTouched');
      
      component.onSubmit();
      
      expect(component.swapForm.get('amount')!.markAsTouched).toHaveBeenCalled();
    });
  });

  describe('Modal controls', () => {
    it('should emit close event', () => {
      spyOn(component.close, 'emit');
      component.closeModal();
      expect(component.close.emit).toHaveBeenCalled();
    });

    it('should reset form on close', () => {
      component.swapForm.patchValue({
        fromCurrency: 'GBP',
        toCurrency: 'JPY',
        amount: '150'
      });
      
      component.closeModal();
      
      expect(component.swapForm.get('fromCurrency')?.value).toBe('USD');
      expect(component.swapForm.get('toCurrency')?.value).toBe('EUR');
      expect(component.swapForm.get('amount')?.value).toBe('');
    });

    it('should reset success state on close', () => {
      component.swapSuccess = true;
      component.successMessage = 'Success!';
      
      component.closeModal();
      
      expect(component.swapSuccess).toBeFalsy();
      expect(component.successMessage).toBe('');
    });
  });

  describe('Component lifecycle', () => {
    it('should handle ngOnInit', () => {
      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('should clean up on destroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle conversion rate updates', () => {
      setupMockStoreSelectors();
      component.swapForm.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: '100'
      });
      
      expect(component.wallet$).toBeDefined();
    });

    it('should validate sufficient balance before swap', fakeAsync(() => {
      const insufficientWallet: WalletModel = {
        ...mockWallet,
        balance: { ...mockWallet.balance, USD: 50 }
      };
      
      mockStore.select.and.callFake((selector: any) => {
        if (selector === selectWallet) {
          return of(insufficientWallet);
        }
        if (selector === getUserEmail) {
          return of('test@example.com');
        }
        if (selector.toString().includes('selectConversionResult')) {
          return of(mockConversionResult);
        }
        return of(null);
      });
      
      // Force recreation of component to pick up new mock
      fixture = TestBed.createComponent(SwapModalComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
      
      component.swapForm.patchValue({
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: '100'
      });
      
      tick();
      
      expect(component.swapForm.valid).toBeFalsy();
      
      component.onSubmit();
      tick();
      
      expect(mockStore.dispatch).not.toHaveBeenCalled();
    }));
  });
});