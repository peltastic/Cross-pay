import { createAction, props } from '@ngrx/store';
import { ExchangeRateResponse, HistoricalRateData, ConversionResult, TimePeriod } from '../../core/models/exchange-rate.model';

export const loadLatestRates = createAction(
  '[Exchange Rate] Load Latest Rates',
  props<{ baseCurrency: string }>()
);

export const loadLatestRatesSuccess = createAction(
  '[Exchange Rate] Load Latest Rates Success',
  props<{ baseCurrency: string; data: ExchangeRateResponse }>()
);

export const loadLatestRatesFailure = createAction(
  '[Exchange Rate] Load Latest Rates Failure',
  props<{ baseCurrency: string; error: string }>()
);

export const loadHistoricalRates = createAction(
  '[Exchange Rate] Load Historical Rates',
  props<{ targetCurrencies: string[]; baseCurrency: string; period: TimePeriod }>()
);

export const loadHistoricalRatesSuccess = createAction(
  '[Exchange Rate] Load Historical Rates Success',
  props<{ data: HistoricalRateData[] }>()
);

export const loadHistoricalRatesFailure = createAction(
  '[Exchange Rate] Load Historical Rates Failure',
  props<{ error: string }>()
);

export const convertCurrency = createAction(
  '[Exchange Rate] Convert Currency',
  props<{ from: string; to: string; amount: number }>()
);

export const convertCurrencySuccess = createAction(
  '[Exchange Rate] Convert Currency Success',
  props<{ data: ConversionResult }>()
);

export const convertCurrencyFailure = createAction(
  '[Exchange Rate] Convert Currency Failure',
  props<{ error: string }>()
);

export const clearExchangeRateErrors = createAction(
  '[Exchange Rate] Clear Errors'
);