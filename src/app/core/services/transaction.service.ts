import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TransactionModel } from '../models/transactions.model';
import { PaginationRequest, PaginatedTransactionResponse } from '../../store/transaction/transaction.actions';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  constructor(private http: HttpClient) {}

  getTransactions(walletAddress: string): Observable<TransactionModel[]> {
    const url = `/api/transactions/${encodeURIComponent(walletAddress)}`;
    return this.http.get<TransactionModel[]>(url);
  }

  getTransactionsPaginated(request: PaginationRequest): Observable<TransactionModel[]> {
    const { walletAddress } = request;
    

    const url = `/api/transactions/${encodeURIComponent(walletAddress)}`;
    return this.http.get<TransactionModel[]>(url);
  }

  loadMoreTransactions(request: PaginationRequest): Observable<TransactionModel[]> {
    return this.getTransactionsPaginated(request);
  }
}
