import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';

import { BaseModalComponent } from '../../../../shared/components/modals/base-modal/base-modal';

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
import { SelectComponent } from '../../../../shared/components/ui/select/select';
import { ButtonComponent } from '../../../../shared/components/ui/button/button';
import { SUPPORTED_CURRENCIES_SHORT } from '../../../../core/constants/currencies';
import { InputComponent } from '../../../../shared/components/ui/input/input';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message';

@Component({
  selector: 'app-deposit-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BaseModalComponent,
    SelectComponent,
    ButtonComponent,
    InputComponent,
    ErrorMessageComponent,
  ],
  templateUrl: './deposit-modal.html',
})
export class DepositModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  depositForm: FormGroup;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;
  wallet$: Observable<any>;

  private subscriptions: Subscription[] = [];

  currencyOptions: { value: string; label: string }[] = SUPPORTED_CURRENCIES_SHORT.map(
    (currency) => ({
      value: currency,
      label: currency,
    })
  );

  constructor(private fb: FormBuilder, private store: Store, private actions$: Actions) {
    this.depositForm = this.fb.group({
      currency: [this.currencyOptions[0].value, [Validators.required]],
      amount: [
        '',
        [Validators.required, Validators.min(0.01), Validators.pattern(/^\d+(\.\d{1,2})?$/)],
      ],
    });

    this.isLoading$ = this.store.select(selectDepositLoading);
    this.error$ = this.store.select(selectDepositError);
    this.wallet$ = this.store.select(selectWallet);
  }

  ngOnInit() {
    this.store.dispatch(clearDepositError());
    this.subscriptions.push(
      this.actions$.pipe(ofType(depositSuccess)).subscribe(() => {
        // setTimeout(() => {
        // }, 1000);
        this.closeModal();
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  closeModal() {
    this.close.emit();
    this.resetForm();
  }

  resetForm() {
    this.depositForm.reset({
      currency: this.currencyOptions[0].value,
      amount: '',
    });
  }

  onSubmit() {
    if (this.depositForm.valid) {
      const { currency, amount } = this.depositForm.value;

      this.subscriptions.push(
        this.store.select(getUserEmail).subscribe((email) => {
          if (email) {
            this.store.dispatch(
              deposit({
                email,
                amount: parseFloat(amount),
                currency,
              })
            );
          }
        })
      );
    } else {
      Object.keys(this.depositForm.controls).forEach((key) => {
        this.depositForm.get(key)?.markAsTouched();
      });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.depositForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['min']) {
        return 'Amount must be greater than 0';
      }
      if (field.errors['pattern']) {
        return 'Please enter a valid amount (e.g., 10.50)';
      }
    }
    return '';
  }
}
