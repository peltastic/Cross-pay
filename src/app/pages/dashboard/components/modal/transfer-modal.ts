import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription, Subject, combineLatest, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter, map, takeUntil, startWith, take } from 'rxjs/operators';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroArrowsRightLeft } from '@ng-icons/heroicons/outline';

import { BaseModalComponent } from '../../../../shared/components/modals/base-modal/base-modal';
import { SelectComponent } from '../../../../shared/components/ui/select/select';
import { ButtonComponent } from '../../../../shared/components/ui/button/button';
import { ExchangeRateService } from '../../../../core/services/exchange-rate.service';
import { SUPPORTED_CURRENCIES_SHORT } from '../../../../core/constants/currencies';
import { getUserEmail } from '../../../../store/user/user.selector';
import {
  selectWallet,
  selectTransferLoading,
  selectTransferError,
} from '../../../../store/wallet/wallet.selector';
import { transfer } from '../../../../store/wallet/wallet.actions';
import { WalletModel } from '../../../../core/models/wallet.model';
import { ConversionResult } from '../../../../core/models/exchange-rate.model';
import { ErrorMessageComponent } from "../../../../shared/components/error-message/error-message";
import { InputComponent } from "../../../../shared/components/ui/input/input";
import * as ExchangeRateActions from '../../../../store/exchange-rate/exchange-rate.actions';
import * as ExchangeRateSelectors from '../../../../store/exchange-rate/exchange-rate.selector';

@Component({
  selector: 'app-transfer-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BaseModalComponent,
    SelectComponent,
    ButtonComponent,
    NgIconComponent,
    ErrorMessageComponent,
    InputComponent
],
  providers: [provideIcons({ heroArrowsRightLeft })],
  templateUrl: './transfer-modal.html',
})
export class TransferModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  transferForm: FormGroup;
  wallet$: Observable<WalletModel | null>;
  userEmail$: Observable<string | null>;
  isTransferring$: Observable<boolean>;
  transferError$: Observable<string | null>;
  
  conversionResult$: Observable<ConversionResult | null>;
  isConverting$: Observable<boolean>;
  conversionError$: Observable<string | null>;

  private destroy$ = new Subject<void>();
  private conversionSubject$ = new Subject<{from: string, to: string, amount: number}>();

  currencyOptions: { value: string; label: string }[] = SUPPORTED_CURRENCIES_SHORT.map(
    (currency) => ({
      value: currency,
      label: currency,
    })
  );

  transferSuccess = false;
  successMessage = '';

  // Custom validator for balance checking
  private balanceValidator = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    const amount = parseFloat(control.value);
    if (isNaN(amount)) return null;

    const availableBalance = this.getAvailableBalance();
    return amount > availableBalance ? { insufficientBalance: { available: availableBalance, requested: amount } } : null;
  };

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private exchangeRateService: ExchangeRateService,
    private cdr: ChangeDetectorRef
  ) {
    this.transferForm = this.fb.group({
      fromCurrency: [this.currencyOptions[0].value, [Validators.required]],
      toCurrency: [this.currencyOptions[1].value, [Validators.required]],
      amount: [
        '',
        [Validators.required, Validators.min(0.01), Validators.pattern(/^\d+(\.\d{1,2})?$/), this.balanceValidator],
      ],
      walletAddress: ['', [Validators.required, Validators.minLength(10)]],
    });

    this.wallet$ = this.store.select(selectWallet);
    this.userEmail$ = this.store.select(getUserEmail);
    this.isTransferring$ = this.store.select(selectTransferLoading);
    this.transferError$ = this.store.select(selectTransferError);
    
    this.isConverting$ = this.store.select(ExchangeRateSelectors.selectConversionLoading);
    this.conversionError$ = this.store.select(ExchangeRateSelectors.selectConversionError);
    
    this.conversionResult$ = this.setupConversionResult();
  }

  private setupConversionResult(): Observable<ConversionResult | null> {
    combineLatest([
      this.transferForm.get('fromCurrency')!.valueChanges.pipe(
        startWith(this.transferForm.get('fromCurrency')!.value)
      ),
      this.transferForm.get('toCurrency')!.valueChanges.pipe(
        startWith(this.transferForm.get('toCurrency')!.value)
      ),
      this.transferForm.get('amount')!.valueChanges.pipe(
        startWith(this.transferForm.get('amount')!.value)
      )
    ]).pipe(
      takeUntil(this.destroy$),
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(([from, to, amount]) => {
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      
      if (from && to && amount && from !== to && numAmount > 0 && !isNaN(numAmount) && !this.transferSuccess) {
        this.store.dispatch(ExchangeRateActions.convertCurrency({
          from,
          to,
          amount: numAmount
        }));
      }
    });

    return this.store.select(ExchangeRateSelectors.selectConversionResult);
  }

  ngOnInit() {
    combineLatest([this.isTransferring$, this.transferError$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([isTransferring, error]) => {
        if (!isTransferring && !error && this.transferForm.valid && !this.transferSuccess) {
          this.transferSuccess = true;
          this.successMessage = 'Transfer completed successfully';
          
          setTimeout(() => {
            this.closeModal();
          }, 2000);
        }
      });

    // Re-validate amount when currency changes
    this.transferForm.get('fromCurrency')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.transferForm.get('amount')?.updateValueAndValidity();
    });

    // Re-validate amount when wallet balance changes
    this.wallet$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.transferForm.get('amount')?.updateValueAndValidity();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    if (!this.transferForm.valid) {
      Object.keys(this.transferForm.controls).forEach((key) => {
        this.transferForm.get(key)?.markAsTouched();
      });
      return;
    }

    const { fromCurrency, toCurrency, amount, walletAddress } = this.transferForm.value;
    const numAmount = parseFloat(amount);

    combineLatest([this.wallet$, this.userEmail$, this.conversionResult$])
      .pipe(take(1))
      .subscribe(([wallet, email, conversionResult]) => {
        if (!wallet || !email) {
          return;
        }

        const availableBalance = wallet.balance[fromCurrency as keyof typeof wallet.balance];
        if (availableBalance < numAmount) {
          return;
        }

        const convertedAmount =
          fromCurrency === toCurrency
            ? numAmount
            : conversionResult?.result || numAmount;
        const exchangeRate =
          fromCurrency === toCurrency ? 1 : conversionResult?.info?.rate || 1;

        this.store.dispatch(
          transfer({
            fromEmail: email,
            toWalletAddress: walletAddress,
            amount: numAmount,
            fromCurrency,
            toCurrency,
            convertedAmount,
            exchangeRate,
          })
        );
      });
  }

  closeModal() {
    this.close.emit();
    this.resetForm();
  }

  resetForm() {
    this.transferForm.reset({
      fromCurrency: this.currencyOptions[0].value,
      toCurrency: this.currencyOptions[1].value,
      amount: '',
      walletAddress: '',
    });
    this.transferSuccess = false;
    this.successMessage = '';
  }

  private resetTransferState() {
    this.transferSuccess = false;
    this.successMessage = '';
  }

  getFieldError(fieldName: string): string {
    const field = this.transferForm.get(fieldName);
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
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        const actualLength = field.errors['minlength'].actualLength;
        return `Wallet address too short. Required: ${requiredLength} characters, current: ${actualLength}`;
      }
      if (field.errors['insufficientBalance']) {
        const available = field.errors['insufficientBalance'].available;
        const fromCurrency = this.transferForm.get('fromCurrency')?.value;
        return `Insufficient balance. Available: ${available.toFixed(2)} ${fromCurrency}`;
      }
    }
    return '';
  }

  getAvailableBalance(): number {
    let balance = 0;
    this.wallet$
      .subscribe((wallet) => {
        if (wallet) {
          const fromCurrency = this.transferForm.get('fromCurrency')?.value;
          balance = wallet.balance[fromCurrency as keyof typeof wallet.balance] || 0;
        }
      })
      .unsubscribe();
    return balance;
  }
}