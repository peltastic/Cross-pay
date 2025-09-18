import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, EMPTY, of, Subject } from 'rxjs';
import { OnboardingForm } from './onboarding-form';
import { createWallet, createWalletSuccess } from '../../../../store/wallet/wallet.actions';
import { setEmail } from '../../../../store/user/user.actions';
import { SessionStorageService } from '../../../../core/services/session-storage.service';

describe('OnboardingForm', () => {
  let component: OnboardingForm;
  let fixture: ComponentFixture<OnboardingForm>;
  let store: MockStore;
  let router: jasmine.SpyObj<Router>;
  let sessionStorageService: jasmine.SpyObj<SessionStorageService>;
  let actions$: Subject<any>;

  const initialState = {
    user: { email: null },
    wallet: {
      wallet: null,
      isCreatingWallet: false,
      createWalletError: null,
    },
  };

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const sessionStorageSpy = jasmine.createSpyObj('SessionStorageService', ['setItem', 'getItem']);
    actions$ = new Subject();

    await TestBed.configureTestingModule({
      imports: [OnboardingForm, ReactiveFormsModule],
      providers: [
        provideMockStore({ initialState }),
        provideMockActions(() => actions$),
        { provide: Router, useValue: routerSpy },
        { provide: SessionStorageService, useValue: sessionStorageSpy },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    sessionStorageService = TestBed.inject(
      SessionStorageService
    ) as jasmine.SpyObj<SessionStorageService>;

    fixture = TestBed.createComponent(OnboardingForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    actions$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form initialization', () => {
    it('should initialize form with email field', () => {
      expect(component.form.get('email')).toBeDefined();
    });

    it('should set email as required', () => {
      const emailControl = component.form.get('email');
      emailControl?.setValue('');
      emailControl?.markAsTouched();

      expect(emailControl?.hasError('required')).toBe(true);
    });

    it('should validate email format', () => {
      const emailControl = component.form.get('email');
      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched();

      expect(emailControl?.hasError('email')).toBe(true);
    });

    it('should accept valid email', () => {
      const emailControl = component.form.get('email');
      emailControl?.setValue('test@example.com');

      expect(emailControl?.valid).toBe(true);
    });

    it('should initialize loading$ observable', () => {
      expect(component.loading$).toBeDefined();
    });

    it('should initialize error$ observable', () => {
      expect(component.error$).toBeDefined();
    });
  });

  describe('ngOnInit', () => {
    it('should subscribe to createWalletSuccess action', () => {
      spyOn(component, 'ngOnInit').and.callThrough();

      component.ngOnInit();

      // Emit the action
      actions$.next(createWalletSuccess());

      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should handle createWalletSuccess action navigation', () => {
      component.ngOnInit();

      actions$.next(createWalletSuccess());

      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should not navigate on other actions', () => {
      component.ngOnInit();

      actions$.next({ type: 'OTHER_ACTION' });

      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy$ subject', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });

    it('should prevent memory leaks', () => {
      const destroySpy = spyOn(component['destroy$'], 'next');
      const completeSpy = spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(destroySpy).toHaveBeenCalledWith();
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('onSubmit', () => {
    describe('valid form submission', () => {
      beforeEach(() => {
        component.form.get('email')?.setValue('test@example.com');
      });

      it('should dispatch setEmail action with form email', () => {
        spyOn(store, 'dispatch');

        component.onSubmit();

        expect(store.dispatch).toHaveBeenCalledWith(setEmail({ email: 'test@example.com' }));
      });

      it('should dispatch createWallet action with form email', () => {
        spyOn(store, 'dispatch');

        component.onSubmit();

        expect(store.dispatch).toHaveBeenCalledWith(createWallet({ email: 'test@example.com' }));
      });

      it('should save email to session storage', () => {
        component.onSubmit();

        expect(sessionStorageService.setItem).toHaveBeenCalledWith('email', 'test@example.com');
      });

      it('should dispatch both actions when form is valid', () => {
        spyOn(store, 'dispatch');

        component.onSubmit();

        expect(store.dispatch).toHaveBeenCalledTimes(2);
      });
    });

    describe('invalid form submission', () => {
      it('should mark all fields as touched when form is invalid', () => {
        component.form.get('email')?.setValue('');
        spyOn(component.form, 'markAllAsTouched');

        component.onSubmit();

        expect(component.form.markAllAsTouched).toHaveBeenCalled();
      });

      it('should not dispatch actions when form is invalid', () => {
        component.form.get('email')?.setValue('');
        spyOn(store, 'dispatch');

        component.onSubmit();

        expect(store.dispatch).not.toHaveBeenCalled();
      });

      it('should not save to session storage when form is invalid', () => {
        component.form.get('email')?.setValue('');

        component.onSubmit();

        expect(sessionStorageService.setItem).not.toHaveBeenCalled();
      });

      it('should handle invalid email format', () => {
        component.form.get('email')?.setValue('invalid-email');
        spyOn(store, 'dispatch');

        component.onSubmit();

        expect(store.dispatch).not.toHaveBeenCalled();
      });

      it('should handle empty email', () => {
        component.form.get('email')?.setValue('');
        spyOn(store, 'dispatch');

        component.onSubmit();

        expect(store.dispatch).not.toHaveBeenCalled();
      });
    });
  });

  describe('emailError getter', () => {
    let emailControl: any;

    beforeEach(() => {
      emailControl = component.form.get('email');
    });

    describe('required error', () => {
      it('should return required error message when email is empty and touched', () => {
        emailControl.setValue('');
        emailControl.markAsTouched();

        expect(component.emailError).toBe('Email is required');
      });

      it('should not return error when email is empty but not touched', () => {
        emailControl.setValue('');

        expect(component.emailError).toBe('');
      });
    });

    describe('email format error', () => {
      it('should return email format error when email is invalid and touched', () => {
        emailControl.setValue('invalid-email');
        emailControl.markAsTouched();

        expect(component.emailError).toBe('Please enter a valid email address');
      });

      it('should not return error when email is invalid but not touched', () => {
        emailControl.setValue('invalid-email');

        expect(component.emailError).toBe('');
      });
    });

    describe('no error cases', () => {
      it('should return empty string when email is valid', () => {
        emailControl.setValue('test@example.com');
        emailControl.markAsTouched();

        expect(component.emailError).toBe('');
      });

      it('should return empty string when no errors exist', () => {
        emailControl.setValue('test@example.com');

        expect(component.emailError).toBe('');
      });

      it('should handle null email control', () => {
        spyOn(component.form, 'get').and.returnValue(null);

        expect(component.emailError).toBe('');
      });
    });

    describe('error precedence', () => {
      it('should prioritize required error over email format error', () => {
        emailControl.setValue('');
        emailControl.markAsTouched();

        // Manually add both errors to test precedence
        emailControl.setErrors({ required: true, email: true });

        expect(component.emailError).toBe('Email is required');
      });
    });
  });

  describe('Store selectors', () => {
    it('should select wallet loading state', () => {
      store.setState({
        ...initialState,
        wallet: { ...initialState.wallet, isCreatingWallet: true },
      });

      component.loading$.subscribe((loading) => {
        expect(loading).toBe(true);
      });
    });

    it('should select wallet error state', () => {
      const errorMessage = 'Test error';
      store.setState({
        ...initialState,
        wallet: { ...initialState.wallet, createWalletError: errorMessage },
      });

      component.error$.subscribe((error) => {
        expect(error).toBe(errorMessage);
      });
    });
  });

  describe('Integration tests', () => {
    it('should handle complete form workflow', () => {
      spyOn(store, 'dispatch');
      const email = 'integration@test.com';

      component.form.get('email')?.setValue(email);

      component.onSubmit();

      expect(sessionStorageService.setItem).toHaveBeenCalledWith('email', email);

      expect(store.dispatch).toHaveBeenCalledWith(setEmail({ email }));
      expect(store.dispatch).toHaveBeenCalledWith(createWallet({ email }));

      actions$.next(createWalletSuccess());

      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should handle form validation errors gracefully', () => {
      spyOn(store, 'dispatch');

      component.onSubmit();

      expect(store.dispatch).not.toHaveBeenCalled();
      expect(sessionStorageService.setItem).not.toHaveBeenCalled();

      expect(component.emailError).toBe('Email is required');
    });
  });

  describe('Edge cases', () => {
    it('should handle whitespace-only email', () => {
      component.form.get('email')?.setValue('   ');
      spyOn(store, 'dispatch');

      component.onSubmit();

      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should handle special characters in email', () => {
      component.form.get('email')?.setValue('test+special@example.com');
      spyOn(store, 'dispatch');

      component.onSubmit();

      expect(store.dispatch).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple dots in email', () => {
      component.form.get('email')?.setValue('test@sub.domain.example.com');
      spyOn(store, 'dispatch');

      component.onSubmit();

      expect(store.dispatch).toHaveBeenCalledTimes(2);
    });

    it('should handle rapid form submissions', () => {
      const email = 'rapid@test.com';
      component.form.get('email')?.setValue(email);
      spyOn(store, 'dispatch');

      component.onSubmit();
      component.onSubmit();
      component.onSubmit();

      expect(store.dispatch).toHaveBeenCalledTimes(6); 
    });
  });
});
