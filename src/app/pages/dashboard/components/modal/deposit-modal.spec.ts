import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, EMPTY, ReplaySubject, of } from 'rxjs';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';

import { DepositModalComponent } from './deposit-modal';
import {
  deposit,
  clearDepositError,
  depositSuccess,
} from '../../../../store/wallet/wallet.actions';
import {
  selectDepositLoading,
  selectDepositError,
  selectWallet,
} from '../../../../store/wallet/wallet.selector';
import { getUserEmail } from '../../../../store/user/user.selector';
import { SUPPORTED_CURRENCIES_SHORT } from '../../../../core/constants/currencies';

describe('DepositModalComponent', () => {
  let component: DepositModalComponent;
  let fixture: ComponentFixture<DepositModalComponent>;
  let mockStore: MockStore;
  let actions$: ReplaySubject<any>;

  const mockInitialState = {
    wallet: {
      wallet: {
        id: '1',
        walletAddress: 'test-address',
        userId: 'user-1',
        balance: {
          USD: 100,
          EUR: 85,
          GBP: 75,
          NGN: 41000,
          JPY: 11000,
          CAD: 130,
          GHS: 580,
          BTC: 0.0025,
        },
      },
      isDepositing: false,
      depositError: null,
      isCreatingWallet: false,
      createWalletError: null,
    },
    user: {
      email: 'test@example.com',
    },
  };

  beforeEach(async () => {
    actions$ = new ReplaySubject(1);

    await TestBed.configureTestingModule({
      imports: [DepositModalComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        provideMockStore({ initialState: mockInitialState }),
        provideMockActions(() => actions$),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DepositModalComponent);
    component = fixture.componentInstance;
    mockStore = TestBed.inject(Store) as MockStore;

    spyOn(mockStore, 'dispatch');
    spyOn(mockStore, 'select').and.callFake((selector: any) => {
      if (selector === selectDepositLoading) return of(false);
      if (selector === selectDepositError) return of(null);
      if (selector === selectWallet) return of(mockInitialState.wallet.wallet);
      if (selector === getUserEmail) return of('test@example.com');
      return of(null);
    });

    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with default values', () => {
      expect(component.depositForm.get('currency')?.value).toBe(SUPPORTED_CURRENCIES_SHORT[0]);
      expect(component.depositForm.get('amount')?.value).toBe('');
    });

    it('should set up currency options from constants', () => {
      expect(component.currencyOptions.length).toBe(SUPPORTED_CURRENCIES_SHORT.length);
      expect(component.currencyOptions[0]).toEqual({
        value: SUPPORTED_CURRENCIES_SHORT[0],
        label: SUPPORTED_CURRENCIES_SHORT[0],
      });
    });

    it('should dispatch clearDepositError on init', () => {
      expect(mockStore.dispatch).toHaveBeenCalledWith(clearDepositError());
    });

    it('should subscribe to depositSuccess action', () => {
      spyOn(component, 'closeModal');
      actions$.next(
        depositSuccess({
          wallet: mockInitialState.wallet.wallet,
          message: 'Deposit successful',
        })
      );

      expect(component.closeModal).toHaveBeenCalled();
    });
  });

  describe('Form Validation Branch Coverage', () => {
    it('should validate required currency field', () => {
      component.depositForm.get('currency')?.setValue('');
      component.depositForm.get('currency')?.markAsTouched();

      expect(component.depositForm.get('currency')?.invalid).toBe(true);
      expect(component.getFieldError('currency')).toBe('Currency is required');
    });

    it('should validate required amount field', () => {
      component.depositForm.get('amount')?.setValue('');
      component.depositForm.get('amount')?.markAsTouched();

      expect(component.depositForm.get('amount')?.invalid).toBe(true);
      expect(component.getFieldError('amount')).toBe('Amount is required');
    });

    it('should validate minimum amount', () => {
      component.depositForm.get('amount')?.setValue('0');
      component.depositForm.get('amount')?.markAsTouched();

      expect(component.depositForm.get('amount')?.invalid).toBe(true);
      expect(component.getFieldError('amount')).toBe('Amount must be greater than 0');
    });

    it('should validate amount pattern - invalid format', () => {
      component.depositForm.get('amount')?.setValue('abc');
      component.depositForm.get('amount')?.markAsTouched();

      expect(component.depositForm.get('amount')?.invalid).toBe(true);
      expect(component.getFieldError('amount')).toBe('Please enter a valid amount (e.g., 10.50)');
    });

    it('should validate amount pattern - valid decimal format', () => {
      component.depositForm.get('amount')?.setValue('10.50');

      expect(component.depositForm.get('amount')?.valid).toBe(true);
      expect(component.getFieldError('amount')).toBe('');
    });

    it('should validate amount pattern - valid integer format', () => {
      component.depositForm.get('amount')?.setValue('100');

      expect(component.depositForm.get('amount')?.valid).toBe(true);
    });

    it('should handle untouched fields in getFieldError', () => {
      component.depositForm.get('amount')?.setValue('');

      expect(component.getFieldError('amount')).toBe('');
    });

    it('should handle fields without errors in getFieldError', () => {
      component.depositForm.get('amount')?.setValue('10.50');
      component.depositForm.get('amount')?.markAsTouched();

      expect(component.getFieldError('amount')).toBe('');
    });
  });

  describe('Form Submission Branch Coverage', () => {
    beforeEach(() => {
      component.depositForm.patchValue({
        currency: 'USD',
        amount: '100.50',
      });
    });

    it('should dispatch deposit action when form is valid and user email exists', () => {
      component.onSubmit();

      expect(mockStore.select).toHaveBeenCalledWith(getUserEmail);
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        deposit({
          email: 'test@example.com',
          amount: 100.5,
          currency: 'USD',
        })
      );
    });

    it('should not dispatch deposit when user email is null', () => {
      mockStore.select = jasmine.createSpy().and.callFake((selector: any) => {
        if (selector === getUserEmail) return of(null);
        return of(null);
      });

      const dispatchSpy = mockStore.dispatch as jasmine.Spy;
      dispatchSpy.calls.reset();

      component.onSubmit();

      expect(dispatchSpy).not.toHaveBeenCalledWith(
        jasmine.objectContaining({ type: deposit.type })
      );
    });

    it('should not dispatch deposit when user email is undefined', () => {
      mockStore.select = jasmine.createSpy().and.callFake((selector: any) => {
        if (selector === getUserEmail) return of(undefined);
        return of(null);
      });

      const dispatchSpy = mockStore.dispatch as jasmine.Spy;
      dispatchSpy.calls.reset();

      component.onSubmit();

      expect(dispatchSpy).not.toHaveBeenCalledWith(
        jasmine.objectContaining({ type: deposit.type })
      );
    });

    it('should mark all fields as touched when form is invalid', () => {
      component.depositForm.patchValue({
        currency: '',
        amount: '',
      });

      spyOn(component.depositForm.get('currency')!, 'markAsTouched');
      spyOn(component.depositForm.get('amount')!, 'markAsTouched');

      component.onSubmit();

      expect(component.depositForm.get('currency')!.markAsTouched).toHaveBeenCalled();
      expect(component.depositForm.get('amount')!.markAsTouched).toHaveBeenCalled();
    });

    it('should not dispatch deposit action when form is invalid', () => {
      component.depositForm.patchValue({
        currency: '',
        amount: 'invalid',
      });

      const dispatchSpy = mockStore.dispatch as jasmine.Spy;
      const initialCallCount = dispatchSpy.calls.count();

      component.onSubmit();

      expect(dispatchSpy.calls.count()).toBe(initialCallCount);
    });
  });

  describe('Modal Management Branch Coverage', () => {
    it('should emit close event when closeModal is called', () => {
      spyOn(component.close, 'emit');
      spyOn(component, 'resetForm');

      component.closeModal();

      expect(component.close.emit).toHaveBeenCalled();
      expect(component.resetForm).toHaveBeenCalled();
    });

    it('should reset form to default values when resetForm is called', () => {
      component.depositForm.patchValue({
        currency: 'EUR',
        amount: '500',
      });

      component.resetForm();

      expect(component.depositForm.get('currency')?.value).toBe(SUPPORTED_CURRENCIES_SHORT[0]);
      expect(component.depositForm.get('amount')?.value).toBe('');
    });

    it('should handle isOpen input property', () => {
      component.isOpen = true;
      expect(component.isOpen).toBe(true);

      component.isOpen = false;
      expect(component.isOpen).toBe(false);
    });
  });

  describe('Observable Selectors Branch Coverage', () => {
    it('should set up observables from store selectors in constructor', () => {
      // These selectors are called in the constructor, verify they're set up
      expect(component.isLoading$).toBeDefined();
      expect(component.error$).toBeDefined();
      expect(component.wallet$).toBeDefined();
    });
  });

  describe('Lifecycle Branch Coverage', () => {
    it('should unsubscribe from all subscriptions on destroy', () => {
      const mockSubscription = {
        unsubscribe: jasmine.createSpy('unsubscribe'),
      };

      component['subscriptions'] = [mockSubscription as any];

      component.ngOnDestroy();

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('should handle multiple subscriptions on destroy', () => {
      const mockSubscriptions = [
        { unsubscribe: jasmine.createSpy('unsubscribe1') },
        { unsubscribe: jasmine.createSpy('unsubscribe2') },
        { unsubscribe: jasmine.createSpy('unsubscribe3') },
      ];

      component['subscriptions'] = mockSubscriptions as any;

      component.ngOnDestroy();

      mockSubscriptions.forEach((sub) => {
        expect(sub.unsubscribe).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling Branch Coverage', () => {
    it('should return empty string for unknown field in getFieldError', () => {
      expect(component.getFieldError('unknownField')).toBe('');
    });

    it('should handle field with no errors object', () => {
      const field = component.depositForm.get('amount');
      Object.defineProperty(field, 'errors', { value: null, configurable: true });
      field!.markAsTouched();

      expect(component.getFieldError('amount')).toBe('');
    });

    it('should prioritize required error over other errors', () => {
      const field = component.depositForm.get('amount');
      field!.setErrors({ required: true, min: true });
      field!.markAsTouched();

      expect(component.getFieldError('amount')).toBe('Amount is required');
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle form submission with decimal amount correctly', () => {
      component.depositForm.patchValue({
        currency: 'EUR',
        amount: '99.99',
      });

      component.onSubmit();

      expect(mockStore.dispatch).toHaveBeenCalledWith(
        deposit({
          email: 'test@example.com',
          amount: 99.99,
          currency: 'EUR',
        })
      );
    });

    it('should handle form submission with integer amount correctly', () => {
      component.depositForm.patchValue({
        currency: 'GBP',
        amount: '1000',
      });

      component.onSubmit();

      expect(mockStore.dispatch).toHaveBeenCalledWith(
        deposit({
          email: 'test@example.com',
          amount: 1000,
          currency: 'GBP',
        })
      );
    });

    it('should handle currency change correctly', () => {
      component.depositForm.get('currency')?.setValue('EUR');

      expect(component.depositForm.get('currency')?.value).toBe('EUR');
      expect(component.depositForm.valid).toBe(false); 
    });

    it('should validate maximum decimal places', () => {
      component.depositForm.get('amount')?.setValue('10.999');

      expect(component.depositForm.get('amount')?.invalid).toBe(true);
    });

    it('should accept valid two decimal places', () => {
      component.depositForm.get('amount')?.setValue('10.99');

      expect(component.depositForm.get('amount')?.valid).toBe(true);
    });
  });
});
