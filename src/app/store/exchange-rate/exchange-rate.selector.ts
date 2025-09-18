import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ExchangeRateState } from './exchange-rate.state';

export const selectExchangeRateState = createFeatureSelector<ExchangeRateState>('exchangeRate');

export const selectCurrentRates = createSelector(
  selectExchangeRateState,
  (state) => state.currentRates
);

export const selectHistoricalData = createSelector(
  selectExchangeRateState,
  (state) => state.historicalData
);

export const selectConversionResult = createSelector(
  selectExchangeRateState,
  (state) => state.conversionResult
);

export const selectExchangeRateLoading = createSelector(
  selectExchangeRateState,
  (state) => state.loading
);

export const selectRatesLoading = createSelector(
  selectExchangeRateLoading,
  (loading) => loading.rates
);

export const selectHistoricalLoading = createSelector(
  selectExchangeRateLoading,
  (loading) => loading.historical
);

export const selectConversionLoading = createSelector(
  selectExchangeRateLoading,
  (loading) => loading.conversion
);

export const selectExchangeRateErrors = createSelector(
  selectExchangeRateState,
  (state) => state.error
);

export const selectRatesError = createSelector(
  selectExchangeRateErrors,
  (errors) => errors.rates
);

export const selectHistoricalError = createSelector(
  selectExchangeRateErrors,
  (errors) => errors.historical
);

export const selectConversionError = createSelector(
  selectExchangeRateErrors,
  (errors) => errors.conversion
);