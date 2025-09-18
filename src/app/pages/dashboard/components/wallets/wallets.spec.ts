import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { Wallets } from './wallets';
import { SessionStorageService } from '../../../../core/services/session-storage.service';
import { WalletModel } from '../../../../core/models/wallet.model';
import { getWallet } from '../../../../store/wallet/wallet.actions';
import { setEmail } from '../../../../store/user/user.actions';
import { SUPPORTED_CURRENCIES_SHORT } from '../../../../core/constants/currencies';

describe('Wallets', () => {
  let component: Wallets;
  let fixture: ComponentFixture<Wallets>;
  let mockStore: MockStore;
  let sessionStorageService: jasmine.SpyObj<SessionStorageService>;

  const mockWallet: WalletModel = {
    id: 'test-id',
    walletAddress: 'test-wallet-address',
    userId: 'test-user-id',
    balance: {
      USD: 1000,
      EUR: 850,
      GBP: 750,
      NGN: 50000,
      JPY: 110000,
      CAD: 1250,
      GHS: 6000,
      BTC: 0.05
    }
  };

  beforeEach(async () => {
    const sessionStorageSpy = jasmine.createSpyObj('SessionStorageService', ['getItem']);

    await TestBed.configureTestingModule({
      imports: [Wallets],
      providers: [
        provideMockStore({
          initialState: {
            wallet: { 
              wallet: null, 
              isCreatingWallet: false, 
              createWalletError: null,
              isFetching: false,
              fetchWalletError: null
            },
            user: {
              email: null
            }
          }
        }),
        { provide: SessionStorageService, useValue: sessionStorageSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Wallets);
    component = fixture.componentInstance;
    mockStore = TestBed.inject(MockStore);
    sessionStorageService = TestBed.inject(SessionStorageService) as jasmine.SpyObj<SessionStorageService>;
    
    spyOn(mockStore, 'dispatch');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should dispatch setEmail and getWallet when email exists in session storage', () => {
      const testEmail = 'test@example.com';
      sessionStorageService.getItem.and.returnValue(testEmail);
      
      component.ngOnInit();
      
      expect(sessionStorageService.getItem).toHaveBeenCalledWith('email');
      expect(mockStore.dispatch).toHaveBeenCalledWith(setEmail({ email: testEmail }));
      expect(mockStore.dispatch).toHaveBeenCalledWith(getWallet({ email: testEmail }));
    });

    it('should not dispatch actions when email does not exist in session storage', () => {
      sessionStorageService.getItem.and.returnValue(null);
      
      component.ngOnInit();
      
      expect(sessionStorageService.getItem).toHaveBeenCalledWith('email');
      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('getBalance', () => {
    beforeEach(() => {
      component.selectedCurrency = 'USD';
    });

    it('should return 0 when wallet is null', () => {
      const balance = component.getBalance(null);
      expect(balance).toBe(0);
    });

    it('should return 0 when wallet is undefined', () => {
      const balance = component.getBalance(undefined as any);
      expect(balance).toBe(0);
    });

    it('should return correct balance for selected currency', () => {
      component.selectedCurrency = 'USD';
      const balance = component.getBalance(mockWallet);
      expect(balance).toBe(1000);
    });

    it('should return correct balance for EUR currency', () => {
      component.selectedCurrency = 'EUR';
      const balance = component.getBalance(mockWallet);
      expect(balance).toBe(850);
    });

    it('should return correct balance for GBP currency', () => {
      component.selectedCurrency = 'GBP';
      const balance = component.getBalance(mockWallet);
      expect(balance).toBe(750);
    });

    it('should return correct balance for JPY currency', () => {
      component.selectedCurrency = 'JPY';
      const balance = component.getBalance(mockWallet);
      expect(balance).toBe(110000);
    });

    it('should return correct balance for CAD currency', () => {
      component.selectedCurrency = 'CAD';
      const balance = component.getBalance(mockWallet);
      expect(balance).toBe(1250);
    });

    it('should return 0 for currency not present in wallet balance', () => {
      component.selectedCurrency = 'LTC'; // Using a currency not in mockWallet
      const balance = component.getBalance(mockWallet);
      expect(balance).toBe(0);
    });

    it('should handle wallet with missing balance property', () => {
      const walletWithoutBalance = { 
        id: 'test-id',
        walletAddress: 'test-address',
        userId: 'test-user-id'
      } as any;
      
      const balance = component.getBalance(walletWithoutBalance);
      expect(balance).toBe(0);
    });

    it('should handle wallet with undefined balance for currency', () => {
      const walletWithPartialBalance = {
        ...mockWallet,
        balance: { 
          ...mockWallet.balance,
          EUR: undefined as any
        }
      };
      
      component.selectedCurrency = 'EUR';
      const balance = component.getBalance(walletWithPartialBalance);
      expect(balance).toBe(0);
    });
  });

  describe('retryGetWallet', () => {
    it('should dispatch getWallet when email exists in session storage', () => {
      const testEmail = 'retry@example.com';
      sessionStorageService.getItem.and.returnValue(testEmail);
      
      component.retryGetWallet();
      
      expect(sessionStorageService.getItem).toHaveBeenCalledWith('email');
      expect(mockStore.dispatch).toHaveBeenCalledWith(getWallet({ email: testEmail }));
    });

    it('should not dispatch getWallet when email does not exist in session storage', () => {
      sessionStorageService.getItem.and.returnValue(null);
      
      component.retryGetWallet();
      
      expect(sessionStorageService.getItem).toHaveBeenCalledWith('email');
      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });

    it('should not dispatch getWallet when email is empty string', () => {
      sessionStorageService.getItem.and.returnValue('');
      
      component.retryGetWallet();
      
      expect(sessionStorageService.getItem).toHaveBeenCalledWith('email');
      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('onCurrencyChange', () => {
    it('should update selectedCurrency', () => {
      const newCurrency = 'EUR';
      component.onCurrencyChange(newCurrency);
      expect(component.selectedCurrency).toBe(newCurrency);
    });

    it('should handle all supported currencies', () => {
      SUPPORTED_CURRENCIES_SHORT.forEach(currency => {
        component.onCurrencyChange(currency);
        expect(component.selectedCurrency).toBe(currency);
      });
    });

    it('should handle unsupported currency', () => {
      const unsupportedCurrency = 'BTC';
      component.onCurrencyChange(unsupportedCurrency);
      expect(component.selectedCurrency).toBe(unsupportedCurrency);
    });
  });

  describe('component initialization', () => {
    it('should initialize with default selectedCurrency', () => {
      expect(component.selectedCurrency).toBe(SUPPORTED_CURRENCIES_SHORT[0]);
    });

    it('should initialize currencyOptions correctly', () => {
      expect(component.currencyOptions).toEqual(
        SUPPORTED_CURRENCIES_SHORT.map(currency => ({
          value: currency,
          label: currency
        }))
      );
    });

    it('should have correct number of currency options', () => {
      expect(component.currencyOptions.length).toBe(SUPPORTED_CURRENCIES_SHORT.length);
    });
  });

  describe('observables initialization', () => {
    it('should initialize wallet$ observable', () => {
      expect(component.wallet$).toBeDefined();
    });

    it('should initialize isLoading$ observable', () => {
      expect(component.isLoading$).toBeDefined();
    });

    it('should initialize error$ observable', () => {
      expect(component.error$).toBeDefined();
    });

    it('should initialize userEmail$ observable', () => {
      expect(component.userEmail$).toBeDefined();
    });
  });

  describe('integration with session storage and store', () => {
    it('should call session storage service during initialization', () => {
      fixture.detectChanges();
      expect(sessionStorageService.getItem).toHaveBeenCalled();
    });

    it('should handle session storage exceptions gracefully', () => {
      sessionStorageService.getItem.and.throwError('Session storage error');
      
      expect(() => component.ngOnInit()).not.toThrow();
    });
  });
});
