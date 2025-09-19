import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
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
  selectSwapLoading,
  selectSwapError,
} from '../../../../store/wallet/wallet.selector';
import { swap } from '../../../../store/wallet/wallet.actions';
import { WalletModel } from '../../../../core/models/wallet.model';
import { ConversionResult } from '../../../../core/models/exchange-rate.model';
import { ErrorMessageComponent } from "../../../../shared/components/error-message/error-message";
import { InputComponent } from "../../../../shared/components/ui/input/input";
import * as ExchangeRateActions from '../../../../store/exchange-rate/exchange-rate.actions';
import * as ExchangeRateSelectors from '../../../../store/exchange-rate/exchange-rate.selector';

@Component({
  selector: 'app-swap-modal',
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
  templateUrl: './swap-modal.html',
})
export class SwapModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  swapForm: FormGroup;
  wallet$: Observable<WalletModel | null>;
  userEmail$: Observable<string | null>;
  isSwapping$: Observable<boolean>;
  swapError$: Observable<string | null>;
  
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

  swapSuccess = false;
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private exchangeRateService: ExchangeRateService,
    private cdr: ChangeDetectorRef
  ) {
    this.swapForm = this.fb.group({
      fromCurrency: [this.currencyOptions[0].value, [Validators.required]],
      toCurrency: [this.currencyOptions[1].value, [Validators.required]],
      amount: [
        '',
        [Validators.required, Validators.min(0.01), Validators.pattern(/^\d+(\.\d{1,2})?$/)],
      ],
    });

    this.wallet$ = this.store.select(selectWallet);
    this.userEmail$ = this.store.select(getUserEmail);
    this.isSwapping$ = this.store.select(selectSwapLoading);
    this.swapError$ = this.store.select(selectSwapError);
    
    this.isConverting$ = this.store.select(ExchangeRateSelectors.selectConversionLoading);
    this.conversionError$ = this.store.select(ExchangeRateSelectors.selectConversionError);
    
    this.conversionResult$ = this.setupConversionResult();
  }

  private setupConversionResult(): Observable<ConversionResult | null> {
    combineLatest([
      this.swapForm.get('fromCurrency')!.valueChanges.pipe(
        startWith(this.swapForm.get('fromCurrency')!.value)
      ),
      this.swapForm.get('toCurrency')!.valueChanges.pipe(
        startWith(this.swapForm.get('toCurrency')!.value)
      ),
      this.swapForm.get('amount')!.valueChanges.pipe(
        startWith(this.swapForm.get('amount')!.value)
      )
    ]).pipe(
      takeUntil(this.destroy$),
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(([from, to, amount]) => {
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      
      if (from && to && amount && from !== to && numAmount > 0 && !isNaN(numAmount)) {
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
    combineLatest([this.isSwapping$, this.swapError$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([isSwapping, error]) => {
        if (!isSwapping && !error && this.swapForm.valid) {
          this.swapSuccess = true;
          this.successMessage = 'Currency swap completed successfully';
          
          setTimeout(() => {
            this.closeModal();
          }, 2000);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    if (!this.swapForm.valid) {
      Object.keys(this.swapForm.controls).forEach((key) => {
        this.swapForm.get(key)?.markAsTouched();
      });
      return;
    }

    const { fromCurrency, toCurrency, amount } = this.swapForm.value;
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
          swap({
            fromEmail: email,
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
    this.swapForm.reset({
      fromCurrency: this.currencyOptions[0].value,
      toCurrency: this.currencyOptions[1].value,
      amount: '',
    });
    this.swapSuccess = false;
    this.successMessage = '';
  }

  private resetSwapState() {
    this.swapSuccess = false;
    this.successMessage = '';
  }

  getFieldError(fieldName: string): string {
    const field = this.swapForm.get(fieldName);
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

  getAvailableBalance(): number {
    let balance = 0;
    this.wallet$.pipe(take(1)).subscribe(wallet => {
      if (wallet) {
        const currency = this.swapForm.get('fromCurrency')?.value;
        balance = wallet.balance[currency as keyof typeof wallet.balance] || 0;
      }
    });
    return balance;
  }
}