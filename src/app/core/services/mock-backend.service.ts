import { Injectable } from '@angular/core';
import { InMemoryDbService, RequestInfo, ResponseOptions } from 'angular-in-memory-web-api';
import { Observable } from 'rxjs';
import { UserModel } from '../models/user.model';
import { WalletModel } from '../models/wallet.model';
import { TransactionModel } from '../models/transactions.model';

@Injectable({ providedIn: 'root' })
export class MockBackendService implements InMemoryDbService {
  private readonly STORAGE_KEYS = {
    USERS: 'cross_pay_users',
    WALLETS: 'cross_pay_wallets',
    TRANSACTIONS: 'cross_pay_transactions',
  };

  constructor() {
    this.initializeLocalStorage();
  }

  createDb() {
    return {
      users: this.getFromStorage<UserModel[]>(this.STORAGE_KEYS.USERS) || [],
      wallets: this.getFromStorage<WalletModel[]>(this.STORAGE_KEYS.WALLETS) || [],
      transactions: this.getFromStorage<TransactionModel[]>(this.STORAGE_KEYS.TRANSACTIONS) || [],
      deposit: [],
      transfer: [],
      swap: [],
    };
  }

  private initializeLocalStorage(): void {
    if (!this.getFromStorage(this.STORAGE_KEYS.USERS)) {
      const defaultUsers: UserModel[] = [{ email: 'test@example.com' }];
      this.saveToStorage(this.STORAGE_KEYS.USERS, defaultUsers);
    }

    this.migrateWalletCurrencies();

    if (!this.getFromStorage(this.STORAGE_KEYS.WALLETS)) {
      const defaultWallets: WalletModel[] = [
        {
          id: 'wallet-1',
          walletAddress: this.generateWalletAddress(),
          userId: 'test@example.com',
          balance: {
            USD: 1000.5,
            EUR: 850.25,
            GBP: 750.75,
            NGN: 2000.0,
            JPY: 50000.0,
            CAD: 1200.0,
            GHS: 6000.0,
            BTC: 0.025,
          },
        },
      ];
      this.saveToStorage(this.STORAGE_KEYS.WALLETS, defaultWallets);
    }

    if (!this.getFromStorage(this.STORAGE_KEYS.TRANSACTIONS)) {
      const wallets = this.getFromStorage<WalletModel[]>(this.STORAGE_KEYS.WALLETS) || [];
      const defaultWalletAddress =
        wallets.length > 0 ? wallets[0].walletAddress : this.generateWalletAddress();

      const defaultTransactions: TransactionModel[] = [
        {
          id: 'txn-001',
          email: 'test@example.com',
          walletAddress: defaultWalletAddress,
          amount: 500.0,
          transactionType: 'deposit',
          direction: 'credit',
          currency: 'USD',
          createdAt: new Date('2024-12-15T10:30:00Z').toISOString(),
        },
      ];
      this.saveToStorage(this.STORAGE_KEYS.TRANSACTIONS, defaultTransactions);
    }
  }

  private migrateWalletCurrencies(): void {
    const existingWallets = this.getFromStorage<any[]>(this.STORAGE_KEYS.WALLETS);
    if (existingWallets && existingWallets.length > 0) {
      const firstWallet = existingWallets[0];
      if (firstWallet.balance && ('USDC' in firstWallet.balance || 'EURC' in firstWallet.balance)) {
        const migratedWallets = existingWallets.map((wallet: any) => ({
          ...wallet,
          balance: {
            USD: wallet.balance.USDC || 1000.5,
            EUR: wallet.balance.EURC || 850.25,
            GBP: wallet.balance.GBPC || 750.75,
            NGN: wallet.balance.BUSD || 2000.0,
            JPY: 50000.0,
            CAD: 1200.0,
            GHS: 6000.0,
            BTC: 0.025,
          },
        }));
        this.saveToStorage(this.STORAGE_KEYS.WALLETS, migratedWallets);
      }
    }
  }

  private getFromStorage<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }

  private saveToStorage<T>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  post(reqInfo: RequestInfo): Observable<any> {
    if (reqInfo.collectionName === 'create' && reqInfo.url.endsWith('/wallet')) {
      return this.createWallet(reqInfo);
    }

    if (reqInfo.collectionName === 'deposit') {
      return this.handleDeposit(reqInfo);
    }

    if (reqInfo.collectionName === 'transfer') {
      return this.handleTransfer(reqInfo);
    }

    if (reqInfo.collectionName === 'swap') {
      return this.handleSwap(reqInfo);
    }

    return reqInfo.utils.createResponse$(() => ({
      status: 404,
      body: { error: 'Route not found' },
    }));
  }

  get(reqInfo: RequestInfo): Observable<any> {
    if (reqInfo.url.includes('/api/wallet/') || reqInfo.collectionName === 'wallet') {
      return this.getWallet(reqInfo);
    }

    if (reqInfo.url.includes('/api/transactions/')) {
      return this.getTransactions(reqInfo);
    }

    return undefined as any;
  }

  private createWallet(reqInfo: RequestInfo): Observable<any> {
    const body = reqInfo.utils.getJsonBody(reqInfo.req);
    const walletAddress = this.generateWalletAddress();

    const newUser: UserModel = { email: body.user };
    const newWallet: WalletModel = {
      id: this.generateId(),
      walletAddress,
      userId: body.user,
      balance: {
        USD: 0,
        EUR: 0,
        GBP: 0,
        NGN: 0,
        JPY: 0,
        CAD: 0,
        GHS: 0,
        BTC: 0,
      },
    };

    const users = this.getFromStorage<UserModel[]>(this.STORAGE_KEYS.USERS) || [];
    const wallets = this.getFromStorage<WalletModel[]>(this.STORAGE_KEYS.WALLETS) || [];

    users.push(newUser);
    wallets.push(newWallet);
    this.saveToStorage(this.STORAGE_KEYS.USERS, users);
    this.saveToStorage(this.STORAGE_KEYS.WALLETS, wallets);

    const db = reqInfo.utils.getDb() as { users: UserModel[]; wallets: WalletModel[] };
    db.users.push(newUser);
    db.wallets.push(newWallet);

    const options: ResponseOptions = {
      body: { user: newUser, wallet: newWallet },
      status: 200,
    };
    return reqInfo.utils.createResponse$(() => options);
  }

  private getWallet(reqInfo: RequestInfo): Observable<any> {
    const url = reqInfo.url;
    const email = decodeURIComponent(url.split('/').pop() || '');
    const db = reqInfo.utils.getDb() as { users: UserModel[]; wallets: WalletModel[] };

    const wallet = db.wallets.find((w) => w.userId === email);
    if (!wallet) {
      const options: ResponseOptions = {
        body: { error: 'Wallet not found' },
        status: 404,
      };
      return reqInfo.utils.createResponse$(() => options);
    }

    const options: ResponseOptions = {
      body: wallet,
      status: 200,
    };
    return reqInfo.utils.createResponse$(() => options);
  }

  private handleDeposit(reqInfo: RequestInfo): Observable<any> {
    const body = reqInfo.utils.getJsonBody(reqInfo.req);
    const { email, amount, currency } = body;

    const wallets = this.getFromStorage<WalletModel[]>(this.STORAGE_KEYS.WALLETS) || [];
    const transactions =
      this.getFromStorage<TransactionModel[]>(this.STORAGE_KEYS.TRANSACTIONS) || [];

    const walletIndex = wallets.findIndex((w) => w.userId === email);

    if (walletIndex === -1) {
      const options: ResponseOptions = {
        body: { error: 'Wallet not found' },
        status: 404,
      };
      return reqInfo.utils.createResponse$(() => options);
    }

    const originalWallet = wallets[walletIndex];

    if (!originalWallet.balance.hasOwnProperty(currency)) {
      const options: ResponseOptions = {
        body: { error: 'Invalid currency' },
        status: 400,
      };
      return reqInfo.utils.createResponse$(() => options);
    }

    const updatedWallet: WalletModel = {
      ...originalWallet,
      balance: {
        ...originalWallet.balance,
        [currency]:
          originalWallet.balance[currency as keyof typeof originalWallet.balance] + amount,
      },
    };

    wallets[walletIndex] = updatedWallet;

    const transaction: TransactionModel = {
      id: this.generateId(),
      email,
      walletAddress: updatedWallet.walletAddress,
      destinationAddress: '',
      amount,
      transactionType: 'deposit',
      direction: 'credit',
      currency: currency as 'USD' | 'EUR' | 'GBP' | 'NGN' | 'JPY' | 'CAD' | 'GHS' | 'BTC',
      createdAt: new Date().toISOString(),
    };

    transactions.push(transaction);

    this.saveToStorage(this.STORAGE_KEYS.WALLETS, wallets);
    this.saveToStorage(this.STORAGE_KEYS.TRANSACTIONS, transactions);

    const db = reqInfo.utils.getDb() as {
      users: UserModel[];
      wallets: WalletModel[];
      transactions: TransactionModel[];
    };
    const dbWalletIndex = db.wallets.findIndex((w) => w.userId === email);
    if (dbWalletIndex !== -1) {
      db.wallets[dbWalletIndex] = updatedWallet;
    }
    db.transactions.push(transaction);

    const options: ResponseOptions = {
      body: {
        success: true,
        wallet: updatedWallet,
        message: `Successfully deposited ${amount} ${currency}`,
      },
      status: 200,
    };
    return reqInfo.utils.createResponse$(() => options);
  }

  private handleTransfer(reqInfo: RequestInfo): Observable<any> {
    const body = reqInfo.utils.getJsonBody(reqInfo.req);
    const {
      fromEmail,
      toWalletAddress,
      amount,
      fromCurrency,
      toCurrency,
      convertedAmount,
      exchangeRate,
    } = body;

    const wallets = this.getFromStorage<WalletModel[]>(this.STORAGE_KEYS.WALLETS) || [];
    const transactions =
      this.getFromStorage<TransactionModel[]>(this.STORAGE_KEYS.TRANSACTIONS) || [];

    const senderWalletIndex = wallets.findIndex((w) => w.userId === fromEmail);
    if (senderWalletIndex === -1) {
      const options: ResponseOptions = {
        body: { error: 'Sender wallet not found' },
        status: 404,
      };
      return reqInfo.utils.createResponse$(() => options);
    }

    const receiverWalletIndex = wallets.findIndex((w) => w.walletAddress === toWalletAddress);
    if (receiverWalletIndex === -1) {
      const options: ResponseOptions = {
        body: { error: 'Receiver wallet not found' },
        status: 404,
      };
      return reqInfo.utils.createResponse$(() => options);
    }

    const senderWallet = wallets[senderWalletIndex];
    const receiverWallet = wallets[receiverWalletIndex];

    if (!senderWallet.balance.hasOwnProperty(fromCurrency)) {
      const options: ResponseOptions = {
        body: { error: 'Invalid sender currency' },
        status: 400,
      };
      return reqInfo.utils.createResponse$(() => options);
    }

    if (!receiverWallet.balance.hasOwnProperty(toCurrency)) {
      const options: ResponseOptions = {
        body: { error: 'Invalid receiver currency' },
        status: 400,
      };
      return reqInfo.utils.createResponse$(() => options);
    }

    const senderBalance = senderWallet.balance[fromCurrency as keyof typeof senderWallet.balance];
    if (senderBalance < amount) {
      const options: ResponseOptions = {
        body: { error: 'Insufficient balance' },
        status: 400,
      };
      return reqInfo.utils.createResponse$(() => options);
    }

    const updatedSenderWallet: WalletModel = {
      ...senderWallet,
      balance: {
        ...senderWallet.balance,
        [fromCurrency]: senderBalance - amount,
      },
    };

    const receiverBalance =
      receiverWallet.balance[toCurrency as keyof typeof receiverWallet.balance];
    const updatedReceiverWallet: WalletModel = {
      ...receiverWallet,
      balance: {
        ...receiverWallet.balance,
        [toCurrency]: receiverBalance + convertedAmount,
      },
    };

    wallets[senderWalletIndex] = updatedSenderWallet;
    wallets[receiverWalletIndex] = updatedReceiverWallet;

    const senderTransaction: TransactionModel = {
      id: this.generateId(),
      email: fromEmail,
      walletAddress: senderWallet.walletAddress,
      destinationAddress: toWalletAddress,
      amount,
      transactionType: 'transfer',
      direction: 'debit',
      currency: fromCurrency as 'USD' | 'EUR' | 'GBP' | 'NGN' | 'JPY' | 'CAD' | 'GHS' | 'BTC',
      createdAt: new Date().toISOString(),
    };

    const receiverTransaction: TransactionModel = {
      id: this.generateId(),
      email: receiverWallet.userId,
      walletAddress: receiverWallet.walletAddress,
      destinationAddress: senderWallet.walletAddress,
      amount: convertedAmount,
      transactionType: 'transfer',
      direction: 'credit',
      currency: toCurrency as 'USD' | 'EUR' | 'GBP' | 'NGN' | 'JPY' | 'CAD' | 'GHS' | 'BTC',
      createdAt: new Date().toISOString(),
    };

    transactions.push(senderTransaction, receiverTransaction);

    this.saveToStorage(this.STORAGE_KEYS.WALLETS, wallets);
    this.saveToStorage(this.STORAGE_KEYS.TRANSACTIONS, transactions);

    const db = reqInfo.utils.getDb() as {
      users: UserModel[];
      wallets: WalletModel[];
      transactions: TransactionModel[];
    };

    const dbSenderWalletIndex = db.wallets.findIndex((w) => w.userId === fromEmail);
    const dbReceiverWalletIndex = db.wallets.findIndex((w) => w.walletAddress === toWalletAddress);

    if (dbSenderWalletIndex !== -1) {
      db.wallets[dbSenderWalletIndex] = updatedSenderWallet;
    }
    if (dbReceiverWalletIndex !== -1) {
      db.wallets[dbReceiverWalletIndex] = updatedReceiverWallet;
    }

    db.transactions.push(senderTransaction, receiverTransaction);

    const options: ResponseOptions = {
      body: {
        success: true,
        message: `Successfully transferred ${amount} ${fromCurrency} to ${toWalletAddress}`,
        senderWallet: updatedSenderWallet,
        receiverWallet: updatedReceiverWallet,
      },
      status: 200,
    };
    return reqInfo.utils.createResponse$(() => options);
  }

  private handleSwap(reqInfo: RequestInfo): Observable<any> {
    const body = reqInfo.utils.getJsonBody(reqInfo.req);
    const {
      fromEmail,
      amount,
      fromCurrency,
      toCurrency,
      convertedAmount,
      exchangeRate,
    } = body;

    const wallets = this.getFromStorage<WalletModel[]>(this.STORAGE_KEYS.WALLETS) || [];
    const transactions =
      this.getFromStorage<TransactionModel[]>(this.STORAGE_KEYS.TRANSACTIONS) || [];

    const walletIndex = wallets.findIndex((w) => w.userId === fromEmail);
    if (walletIndex === -1) {
      const options: ResponseOptions = {
        body: { error: 'Wallet not found' },
        status: 404,
      };
      return reqInfo.utils.createResponse$(() => options);
    }

    const wallet = wallets[walletIndex];

    if (!wallet.balance.hasOwnProperty(fromCurrency)) {
      const options: ResponseOptions = {
        body: { error: 'Invalid source currency' },
        status: 400,
      };
      return reqInfo.utils.createResponse$(() => options);
    }

    if (!wallet.balance.hasOwnProperty(toCurrency)) {
      const options: ResponseOptions = {
        body: { error: 'Invalid target currency' },
        status: 400,
      };
      return reqInfo.utils.createResponse$(() => options);
    }

    const fromBalance = wallet.balance[fromCurrency as keyof typeof wallet.balance];
    if (fromBalance < amount) {
      const options: ResponseOptions = {
        body: { error: 'Insufficient balance' },
        status: 400,
      };
      return reqInfo.utils.createResponse$(() => options);
    }

    const toBalance = wallet.balance[toCurrency as keyof typeof wallet.balance];
    const updatedWallet: WalletModel = {
      ...wallet,
      balance: {
        ...wallet.balance,
        [fromCurrency]: fromBalance - amount,
        [toCurrency]: toBalance + convertedAmount,
      },
    };

    wallets[walletIndex] = updatedWallet;

    const swapTransaction: TransactionModel = {
      id: this.generateId(),
      email: fromEmail,
      walletAddress: wallet.walletAddress,
      destinationAddress: wallet.walletAddress,
      amount,
      transactionType: 'swap',
      direction: 'swap',
      currency: fromCurrency as 'USD' | 'EUR' | 'GBP' | 'NGN' | 'JPY' | 'CAD' | 'GHS' | 'BTC',
      createdAt: new Date().toISOString(),
    };

    transactions.push(swapTransaction);

    this.saveToStorage(this.STORAGE_KEYS.WALLETS, wallets);
    this.saveToStorage(this.STORAGE_KEYS.TRANSACTIONS, transactions);

    const db = reqInfo.utils.getDb() as {
      users: UserModel[];
      wallets: WalletModel[];
      transactions: TransactionModel[];
    };

    const dbWalletIndex = db.wallets.findIndex((w) => w.userId === fromEmail);
    if (dbWalletIndex !== -1) {
      db.wallets[dbWalletIndex] = updatedWallet;
    }

    db.transactions.push(swapTransaction);

    const options: ResponseOptions = {
      body: {
        success: true,
        message: `Successfully swapped ${amount} ${fromCurrency} to ${convertedAmount.toFixed(2)} ${toCurrency}`,
        wallet: updatedWallet,
      },
      status: 200,
    };
    return reqInfo.utils.createResponse$(() => options);
  }

  private getTransactions(reqInfo: RequestInfo): Observable<any> {
    const url = reqInfo.url;
    const urlParts = url.split('/');
    // Handle both /api/transactions/{walletAddress} and /api/transactions/{walletAddress}/paginated
    const walletAddress = decodeURIComponent(
      urlParts[urlParts.length - 1] === 'paginated'
        ? urlParts[urlParts.length - 2]
        : urlParts[urlParts.length - 1]
    );

    const db = reqInfo.utils.getDb() as {
      users: UserModel[];
      wallets: WalletModel[];
      transactions: TransactionModel[];
    };

    const transactions = db.transactions.filter((t) => t.walletAddress === walletAddress);

    const options: ResponseOptions = {
      body: transactions,
      status: 200,
    };
    return reqInfo.utils.createResponse$(() => options);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  private generateWalletAddress(): string {
    const length = Math.floor(Math.random() * 5) + 10;
    let address = '';
    for (let i = 0; i < length; i++) {
      address += Math.floor(Math.random() * 10);
    }
    return address;
  }

  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEYS.USERS);
    localStorage.removeItem(this.STORAGE_KEYS.WALLETS);
    localStorage.removeItem(this.STORAGE_KEYS.TRANSACTIONS);
    this.initializeLocalStorage();
  }

  exportData(): { users: UserModel[]; wallets: WalletModel[]; transactions: TransactionModel[] } {
    return {
      users: this.getFromStorage<UserModel[]>(this.STORAGE_KEYS.USERS) || [],
      wallets: this.getFromStorage<WalletModel[]>(this.STORAGE_KEYS.WALLETS) || [],
      transactions: this.getFromStorage<TransactionModel[]>(this.STORAGE_KEYS.TRANSACTIONS) || [],
    };
  }
}
