import { createReducer, on } from '@ngrx/store';
import { ExchangeRateState, initialExchangeRateState } from './exchange-rate.state';
import * as ExchangeRateActions from './exchange-rate.actions';

export const exchangeRateReducer = createReducer(
  initialExchangeRateState,
  
  on(ExchangeRateActions.loadLatestRates, (state) => ({
    ...state,
    loading: { ...state.loading, rates: true },
    error: { ...state.error, rates: null }
  })),

  on(ExchangeRateActions.loadLatestRatesSuccess, (state, { data }) => ({
    ...state,
    currentRates: data,
    loading: { ...state.loading, rates: false },
    error: { ...state.error, rates: null }
  })),

  on(ExchangeRateActions.loadLatestRatesFailure, (state, { error }) => ({
    ...state,
    loading: { ...state.loading, rates: false },
    error: { ...state.error, rates: error }
  })),

  on(ExchangeRateActions.loadHistoricalRates, (state) => ({
    ...state,
    loading: { ...state.loading, historical: true },
    error: { ...state.error, historical: null }
  })),

  on(ExchangeRateActions.loadHistoricalRatesSuccess, (state, { data }) => ({
    ...state,
    historicalData: data,
    loading: { ...state.loading, historical: false },
    error: { ...state.error, historical: null }
  })),

  on(ExchangeRateActions.loadHistoricalRatesFailure, (state, { error }) => ({
    ...state,
    loading: { ...state.loading, historical: false },
    error: { ...state.error, historical: error }
  })),

  on(ExchangeRateActions.convertCurrency, (state) => ({
    ...state,
    loading: { ...state.loading, conversion: true },
    error: { ...state.error, conversion: null }
  })),

  on(ExchangeRateActions.convertCurrencySuccess, (state, { data }) => {
    return {
      ...state,
      conversionResult: data,
      loading: { ...state.loading, conversion: false },
      error: { ...state.error, conversion: null }
    };
  }),

  on(ExchangeRateActions.convertCurrencyFailure, (state, { error }) => ({
    ...state,
    loading: { ...state.loading, conversion: false },
    error: { ...state.error, conversion: error }
  })),

  on(ExchangeRateActions.clearExchangeRateErrors, (state) => ({
    ...state,
    error: {
      rates: null,
      historical: null,
      conversion: null
    }
  }))
);