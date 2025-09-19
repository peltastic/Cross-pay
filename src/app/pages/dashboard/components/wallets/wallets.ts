import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { SelectComponent } from '../../../../shared/components/ui/select/select';
import { WalletSkeletonComponent } from '../../../../shared/components/skeleton/wallet-skeleton/wallet-skeleton';
import { WalletModel } from '../../../../core/models/wallet.model';
import {
  selectWallet,
  selectWalletFetching,
  selectWalletFetchError,
} from '../../../../store/wallet/wallet.selector';
import { getUserEmail } from '../../../../store/user/user.selector';
import { getWallet } from '../../../../store/wallet/wallet.actions';
import { setEmail } from '../../../../store/user/user.actions';
import { SessionStorageService } from '../../../../core/services/session-storage.service';
import { SUPPORTED_CURRENCIES_SHORT } from '../../../../core/constants/currencies';
import { ButtonComponent } from '../../../../shared/components/ui/button/button';

@Component({
  selector: 'app-wallets',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectComponent, WalletSkeletonComponent, ButtonComponent],
  templateUrl: './wallets.html',
})
export class Wallets implements OnInit {
  wallet$: Observable<WalletModel | null>;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;
  userEmail$: Observable<string | null>;
  selectedCurrency: string = SUPPORTED_CURRENCIES_SHORT[0];
  currencyOptions = SUPPORTED_CURRENCIES_SHORT.map((currency) => ({
    value: currency,
    label: currency,
  }));

  constructor(private store: Store, private sessionStorageService: SessionStorageService) {
    this.wallet$ = this.store.select(selectWallet);
    this.isLoading$ = this.store.select(selectWalletFetching);
    this.error$ = this.store.select(selectWalletFetchError);
    this.userEmail$ = this.store.select(getUserEmail);
  }

  ngOnInit() {
    try {
      const storedEmail = this.sessionStorageService.getItem<string>('email');
      if (storedEmail) {
        this.store.dispatch(setEmail({ email: storedEmail }));
        this.store.dispatch(getWallet({ email: storedEmail }));
      }
    } catch (error) {
      console.error('Error accessing session storage:', error);
    }
  }

  getBalance(wallet: WalletModel | null): number {
    if (!wallet || !wallet.balance) return 0;
    const balance = wallet.balance[this.selectedCurrency as keyof typeof wallet.balance] || 0;
    return balance;
  }

  retryGetWallet() {
    try {
      const storedEmail = this.sessionStorageService.getItem<string>('email');
      if (storedEmail) {
        this.store.dispatch(getWallet({ email: storedEmail }));
      }
    } catch (error) {
      console.error('Error accessing session storage:', error);
    }
  }

  onCurrencyChange(currency: string) {
    this.selectedCurrency = currency;
  }
}
