import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, mergeMap, switchMap, withLatestFrom, filter } from 'rxjs/operators';
import { of } from 'rxjs';
import { ExchangeRateService } from '../../core/services/exchange-rate.service';
import { CacheService } from '../../core/services/cache.service';
import { mapHttpErrorToAppError } from '../../core/models/error.model';
import * as ExchangeRateActions from './exchange-rate.actions';
import * as ExchangeRateSelectors from './exchange-rate.selector';
import * as ErrorActions from '../error/error.actions';

@Injectable()
export class ExchangeRateEffects {
  private actions$ = inject(Actions);
  private exchangeRateService = inject(ExchangeRateService);
  private cacheService = inject(CacheService);
  private store = inject(Store);

  loadLatestRates$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExchangeRateActions.loadLatestRates),
      switchMap(({ baseCurrency }) =>
        this.exchangeRateService.getLatestRates(baseCurrency).pipe(
          map(data => ExchangeRateActions.loadLatestRatesSuccess({ baseCurrency, data })),
          catchError(error => {
            const appError = mapHttpErrorToAppError(error, { action: 'loadLatestRates', baseCurrency });
            this.store.dispatch(ErrorActions.addError({ error: appError }));
            return of(ExchangeRateActions.loadLatestRatesFailure({ 
              baseCurrency, 
              error: appError.message 
            }));
          })
        )
      )
    )
  );

  loadHistoricalRates$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExchangeRateActions.loadHistoricalRates),
      switchMap(({ targetCurrencies, baseCurrency, period }) => {
        const cacheKey = `historical_rates_${targetCurrencies.join('_')}_${baseCurrency}_${period}`;
        const cached = this.cacheService.get<any[]>(cacheKey);
        
        if (cached && !navigator.onLine) {
          return of(ExchangeRateActions.loadHistoricalRatesSuccess({ data: cached }));
        }

        return this.exchangeRateService.getHistoricalRatesForMultipleCurrencies(targetCurrencies, baseCurrency, period).pipe(
          map(data => ExchangeRateActions.loadHistoricalRatesSuccess({ data })),
          catchError(error => {
            const fallbackCached = this.cacheService.get<any[]>(cacheKey);
            if (fallbackCached) {
              return of(ExchangeRateActions.loadHistoricalRatesSuccess({ data: fallbackCached }));
            }
            
            const appError = mapHttpErrorToAppError(error, { 
              action: 'loadHistoricalRates', 
              targetCurrencies, 
              baseCurrency, 
              period 
            });
            this.store.dispatch(ErrorActions.addError({ error: appError }));
            return of(ExchangeRateActions.loadHistoricalRatesFailure({ 
              error: appError.message 
            }));
          })
        );
      })
    )
  );

  convertCurrency$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExchangeRateActions.convertCurrency),
      switchMap(({ from, to, amount }) => {
        return this.exchangeRateService.convertCurrency(from, to, amount).pipe(
          map(data => {
            return ExchangeRateActions.convertCurrencySuccess({ data });
          }),
          catchError(error => {
            const appError = mapHttpErrorToAppError(error, { 
              action: 'convertCurrency', 
              from, 
              to, 
              amount 
            });
            this.store.dispatch(ErrorActions.addError({ error: appError }));
            return of(ExchangeRateActions.convertCurrencyFailure({ 
              error: appError.message 
            }));
          })
        );
      })
    )
  );
}