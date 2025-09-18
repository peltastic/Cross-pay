import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WalletModel } from '../models/wallet.model';
import { UserModel } from '../models/user.model';

export interface DepositRequest {
  email: string;
  amount: number;
  currency: string;
}

export interface DepositResponse {
  success: boolean;
  wallet: WalletModel;
  message: string;
}

export interface TransferRequest {
  fromEmail: string;
  toWalletAddress: string;
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  convertedAmount: number;
  exchangeRate: number;
}

export interface TransferResponse {
  success: boolean;
  message: string;
  senderWallet: WalletModel;
  receiverWallet: WalletModel;
}

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  constructor(private http: HttpClient) {}

  createWallet(email: string): Observable<{ user: UserModel; wallet: WalletModel }> {
    return this.http.post<{ user: UserModel; wallet: WalletModel }>('/api/create/wallet', {
      user: email,
    });
  }

  getWallet(email: string): Observable<WalletModel> {
    const url = `/api/wallet/${encodeURIComponent(email)}`;
    return this.http.get<WalletModel>(url);
  }

  deposit(depositRequest: DepositRequest): Observable<DepositResponse> {
    return this.http.post<DepositResponse>('/api/deposit', depositRequest);
  }

  transfer(transferRequest: TransferRequest): Observable<TransferResponse> {
    return this.http.post<TransferResponse>('/api/transfer', transferRequest);
  }
}