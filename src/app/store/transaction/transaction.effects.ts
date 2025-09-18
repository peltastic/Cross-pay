import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { TransactionService } from '../../core/services/transaction.service';
import { mapHttpErrorToAppError } from '../../core/models/error.model';
import * as ErrorActions from '../error/error.actions';
import {
  getTransactions,
  getTransactionsSuccess,
  getTransactionsFailure,
  loadMoreTransactions,
  loadMoreTransactionsSuccess,
  loadMoreTransactionsFailure,
} from './transaction.actions';

@Injectable()
export class TransactionEffects {
  private actions$ = inject(Actions);
  private transactionService = inject(TransactionService);
  private store = inject(Store);

  getTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getTransactions),
      switchMap((request) => {
        return this.transactionService.getTransactionsPaginated(request).pipe(
          map((allTransactions) => {
            const {
              page = 0,
              pageSize = 20,
              sortBy = 'createdAt',
              sortDirection = 'desc',
            } = request;

            const sortedTransactions = [...allTransactions].sort((a, b) => {
              const aValue = (a as any)[sortBy];
              const bValue = (b as any)[sortBy];
              if (sortDirection === 'desc') {
                return new Date(bValue).getTime() - new Date(aValue).getTime();
              } else {
                return new Date(aValue).getTime() - new Date(bValue).getTime();
              }
            });

            const totalCount = sortedTransactions.length;
            const startIndex = page * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedTransactions = sortedTransactions.slice(startIndex, endIndex);
            const hasMore = endIndex < totalCount;

            const response = {
              transactions: paginatedTransactions,
              totalCount,
              page,
              pageSize,
              hasMore,
            };

            return getTransactionsSuccess({ response });
          }),
          catchError((error) => {
            const appError = mapHttpErrorToAppError(error, {
              action: 'getTransactions',
              ...request,
            });
            this.store.dispatch(ErrorActions.addError({ error: appError }));
            return of(getTransactionsFailure({ error: appError.message }));
          })
        );
      })
    )
  );

  loadMoreTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadMoreTransactions),
      switchMap((request) =>
        this.transactionService.loadMoreTransactions(request).pipe(
          map((allTransactions) => {
            const {
              page = 0,
              pageSize = 20,
              sortBy = 'createdAt',
              sortDirection = 'desc',
            } = request;

            const sortedTransactions = [...allTransactions].sort((a, b) => {
              const aValue = (a as any)[sortBy];
              const bValue = (b as any)[sortBy];
              if (sortDirection === 'desc') {
                return new Date(bValue).getTime() - new Date(aValue).getTime();
              } else {
                return new Date(aValue).getTime() - new Date(bValue).getTime();
              }
            });

            const totalCount = sortedTransactions.length;
            const startIndex = page * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedTransactions = sortedTransactions.slice(startIndex, endIndex);
            const hasMore = endIndex < totalCount;

            const response = {
              transactions: paginatedTransactions,
              totalCount,
              page,
              pageSize,
              hasMore,
            };

            return loadMoreTransactionsSuccess({ response });
          }),
          catchError((error) => {
            const appError = mapHttpErrorToAppError(error, {
              action: 'loadMoreTransactions',
              ...request,
            });
            this.store.dispatch(ErrorActions.addError({ error: appError }));
            return of(loadMoreTransactionsFailure({ error: appError.message }));
          })
        )
      )
    )
  );
}
