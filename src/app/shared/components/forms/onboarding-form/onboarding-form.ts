import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InputComponent } from '../../ui/input/input';
import { ButtonComponent } from '../../ui/button/button';
import { createWallet, createWalletSuccess } from '../../../../store/wallet/wallet.actions';
import { selectWalletLoading, selectWalletError } from '../../../../store/wallet/wallet.selector';
import { setEmail } from '../../../../store/user/user.actions';
import { Actions, ofType } from '@ngrx/effects';
import { SessionStorageService } from '../../../../core/services/session-storage.service';

@Component({
  selector: 'app-onboarding-form',
  imports: [InputComponent, ButtonComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './onboarding-form.html',
})
export class OnboardingForm implements OnInit, OnDestroy {
  form: FormGroup;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router,
    private actions$: Actions,
    private sessionStorageService: SessionStorageService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
    
    this.loading$ = this.store.select(selectWalletLoading);
    this.error$ = this.store.select(selectWalletError);
  }

  ngOnInit() {
    this.actions$.pipe(
      ofType(createWalletSuccess),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.router.navigate(['/dashboard']);
    });
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    if (this.form.valid) {
      const email = this.form.get('email')?.value;
      this.sessionStorageService.setItem('email', email);
      this.store.dispatch(setEmail({ email }));
      this.store.dispatch(createWallet({ email }));
    } else {
      this.form.markAllAsTouched();
    }
  }

  get emailError() {
    const emailControl = this.form.get('email');
    if (emailControl?.errors && emailControl.touched) {
      if (emailControl.errors['required']) {
        return 'Email is required';
      }
      if (emailControl.errors['email']) {
        return 'Please enter a valid email address';
      }
    }
    return '';
  }
}
