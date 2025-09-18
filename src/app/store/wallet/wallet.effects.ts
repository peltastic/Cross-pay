import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { WalletService } from '../../core/services/wallet.service';
import {
  createWallet,
  createWalletSuccess,
  createWalletFailure,
  getWallet,
  getWalletSuccess,
  getWalletFailure,
  deposit,
  depositSuccess,
  depositFailure,
  transfer,
  transferSuccess,
  transferFailure,
} from './wallet.actions';
import { setEmail } from '../user/user.actions';

@Injectable()
export class WalletEffects {
  private actions$ = inject(Actions);
  private walletService = inject(WalletService);
  private store = inject(Store);

  createWallet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createWallet),
      switchMap(({ email }) =>
        this.walletService.createWallet(email).pipe(
          map((response) => {
            this.store.dispatch(setEmail({ email: response.user.email }));
            return createWalletSuccess();
          }),
          catchError((error) =>
            of(createWalletFailure({ error: error.message || 'Failed to create wallet' }))
          )
        )
      )
    )
  );

  getWallet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getWallet),
      switchMap(({ email }) =>
        this.walletService.getWallet(email).pipe(
          map((wallet) => getWalletSuccess({ wallet })),
          catchError((error) =>
            of(getWalletFailure({ error: error.message || 'Failed to get wallet' }))
          )
        )
      )
    )
  );

  deposit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deposit),
      switchMap(({ email, amount, currency }) => {
        return this.walletService.deposit({ email, amount, currency }).pipe(
          map((response) => {
            return depositSuccess({
              wallet: response.wallet,
              message: response.message,
            });
          }),
          catchError((error) => {
            return of(
              depositFailure({
                error: error.error?.error || error.message || 'Failed to process deposit',
              })
            );
          })
        );
      })
    )
  );

  transfer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(transfer),
      switchMap(
        ({
          fromEmail,
          toWalletAddress,
          amount,
          fromCurrency,
          toCurrency,
          convertedAmount,
          exchangeRate,
        }) => {
          return this.walletService
            .transfer({
              fromEmail,
              toWalletAddress,
              amount,
              fromCurrency,
              toCurrency,
              convertedAmount,
              exchangeRate,
            })
            .pipe(
              map((response) => {
                return transferSuccess({
                  senderWallet: response.senderWallet,
                  message: response.message,
                });
              }),
              catchError((error) => {
                return of(
                  transferFailure({
                    error: error.error?.error || error.message || 'Failed to process transfer',
                  })
                );
              })
            );
        }
      )
    )
  );
}
