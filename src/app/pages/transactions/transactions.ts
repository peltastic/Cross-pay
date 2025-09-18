import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { DashboardLayout } from '../../layout/dashboard-layout/dashboard-layout';
import { DataTableComponent, DataTableColumn } from '../../shared/components/ui/data-table/data-table';
import { ButtonComponent } from '../../shared/components/ui/button/button';
import { TransactionModel } from '../../core/models/transactions.model';
import { 
  selectPaginatedTransactions,
  selectTransactionHasMore,
  selectTransactionLoadingMore 
} from '../../store/transaction/transaction.selector';
import { selectWallet } from '../../store/wallet/wallet.selector';
import { getUserEmail } from '../../store/user/user.selector';
import { 
  getTransactions, 
  loadMoreTransactions, 
  setTransactionPageSize 
} from '../../store/transaction/transaction.actions';
import { getWallet } from '../../store/wallet/wallet.actions';
import { setEmail } from '../../store/user/user.actions';
import { SessionStorageService } from '../../core/services/session-storage.service';

interface PaginatedTransactionData {
  transactions: TransactionModel[];
  pagination: {
    totalCount: number;
    currentPage: number;
    pageSize: number;
    hasMore: boolean;
  };
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  loadMoreError: string | null;
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, DashboardLayout, DataTableComponent, ButtonComponent],
  templateUrl: './transactions.html',
})
export class Transactions implements OnInit, OnDestroy {
  paginatedData$: Observable<PaginatedTransactionData>;
  hasMore$: Observable<boolean>;
  loadingMore$: Observable<boolean>;
  
  private destroy$ = new Subject<void>();
  private currentWalletAddress: string | null = null;

  columns: DataTableColumn[] = [
    { key: 'id', header: 'Transaction ID', width: '200px' },
    { key: 'transactionType', header: 'Type', width: '120px' },
    { key: 'amount', header: 'Amount', width: '150px' },
    { key: 'currency', header: 'Currency', width: '100px' },
    { key: 'destinationAddress', header: 'Destination', width: '200px' },
  ];

  constructor(private store: Store, private sessionStorageService: SessionStorageService) {
    this.paginatedData$ = this.store.select(selectPaginatedTransactions);
    this.hasMore$ = this.store.select(selectTransactionHasMore);
    this.loadingMore$ = this.store.select(selectTransactionLoadingMore);
  }

  ngOnInit() {
    this.initializeWalletData();
    
    this.store.select(selectWallet).pipe(
      filter(wallet => !!wallet),
      takeUntil(this.destroy$)
    ).subscribe(wallet => {
      if (wallet && wallet.walletAddress !== this.currentWalletAddress) {
        this.currentWalletAddress = wallet.walletAddress;
        this.loadInitialTransactions(wallet.walletAddress);
      }
    });
  }

  private initializeWalletData() {
    const storedEmail = this.sessionStorageService.getItem<string>('email');
    if (storedEmail) {
      this.store.dispatch(setEmail({ email: storedEmail }));
      this.store.dispatch(getWallet({ email: storedEmail }));
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadInitialTransactions(walletAddress: string) {
    this.store.dispatch(getTransactions({ 
      walletAddress,
      page: 0,
      pageSize: 20 
    }));
  }

  onLoadMore() {
    if (this.currentWalletAddress) {
      this.paginatedData$.pipe(takeUntil(this.destroy$)).subscribe(data => {
        if (data.pagination.hasMore) {
          this.store.dispatch(loadMoreTransactions({
            walletAddress: this.currentWalletAddress!,
            page: data.pagination.currentPage + 1,
            pageSize: data.pagination.pageSize
          }));
        }
      });
    }
  }

  onPageSizeChange(pageSize: number) {
    this.store.dispatch(setTransactionPageSize({ pageSize }));
    if (this.currentWalletAddress) {
      this.loadInitialTransactions(this.currentWalletAddress);
    }
  }
}
