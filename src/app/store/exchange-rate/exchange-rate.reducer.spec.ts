import { exchangeRateReducer } from './exchange-rate.reducer';
import { initialExchangeRateState, ExchangeRateState } from './exchange-rate.state';
import * as ExchangeRateActions from './exchange-rate.actions';
import { ExchangeRateResponse, ConversionResult } from '../../core/models/exchange-rate.model';

describe('ExchangeRateReducer', () => {
  const mockExchangeRateResponse: ExchangeRateResponse = {
    base: 'USD',
    rates: {
      BTC: 0.000025,
      CAD: 1.35,
      EUR: 0.85,
      GBP: 0.75,
      GHS: 12.0,
      NGN: 1650.0,
      USD: 1.0
    },
    date: '2025-09-18',
    success: true,
    timestamp: 1726675200
  };

  const mockConversionResult: ConversionResult = {
    success: true,
    query: {
      from: 'USD',
      to: 'NGN',
      amount: 100
    },
    info: {
      timestamp: 1726675200,
      rate: 1650.0
    },
    result: 165000
  };

  describe('loadLatestRates', () => {
    it('should set loading to true and clear errors', () => {
      const action = ExchangeRateActions.loadLatestRates({ baseCurrency: 'USD' });
      const state = exchangeRateReducer(initialExchangeRateState, action);

      expect(state.loading.rates).toBe(true);
      expect(state.error.rates).toBe(null);
    });
  });

  describe('loadLatestRatesSuccess', () => {
    it('should store rates and set loading to false', () => {
      const previousState: ExchangeRateState = {
        ...initialExchangeRateState,
        loading: { ...initialExchangeRateState.loading, rates: true }
      };

      const action = ExchangeRateActions.loadLatestRatesSuccess({
        baseCurrency: 'USD',
        data: mockExchangeRateResponse
      });

      const state = exchangeRateReducer(previousState, action);

      expect(state.loading.rates).toBe(false);
      expect(state.error.rates).toBe(null);
      expect(state.currentRates).toEqual(mockExchangeRateResponse);
    });
  });

  describe('loadLatestRatesFailure', () => {
    it('should set error and loading to false', () => {
      const previousState: ExchangeRateState = {
        ...initialExchangeRateState,
        loading: { ...initialExchangeRateState.loading, rates: true }
      };

      const action = ExchangeRateActions.loadLatestRatesFailure({
        baseCurrency: 'USD',
        error: 'Network error'
      });

      const state = exchangeRateReducer(previousState, action);

      expect(state.loading.rates).toBe(false);
      expect(state.error.rates).toBe('Network error');
    });
  });

  describe('convertCurrencySuccess', () => {
    it('should store conversion result and set loading to false', () => {
      const previousState: ExchangeRateState = {
        ...initialExchangeRateState,
        loading: { ...initialExchangeRateState.loading, conversion: true }
      };

      const action = ExchangeRateActions.convertCurrencySuccess({
        data: mockConversionResult
      });

      const state = exchangeRateReducer(previousState, action);

      expect(state.loading.conversion).toBe(false);
      expect(state.error.conversion).toBe(null);
      expect(state.conversionResult).toEqual(mockConversionResult);
    });
  });

  describe('clearExchangeRateErrors', () => {
    it('should clear all errors', () => {
      const previousState: ExchangeRateState = {
        ...initialExchangeRateState,
        error: {
          rates: 'Some error',
          historical: 'Another error',
          conversion: 'Conversion error'
        }
      };

      const action = ExchangeRateActions.clearExchangeRateErrors();
      const state = exchangeRateReducer(previousState, action);

      expect(state.error.rates).toBe(null);
      expect(state.error.historical).toBe(null);
      expect(state.error.conversion).toBe(null);
    });
  });
});