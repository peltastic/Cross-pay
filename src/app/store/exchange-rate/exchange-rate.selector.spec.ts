import * as ExchangeRateSelectors from './exchange-rate.selector';
import { ExchangeRateState } from './exchange-rate.state';
import { ExchangeRateResponse, ConversionResult } from '../../core/models/exchange-rate.model';

describe('ExchangeRateSelectors', () => {
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

  const mockState: ExchangeRateState = {
    currentRates: mockExchangeRateResponse,
    historicalData: null,
    conversionResult: mockConversionResult,
    loading: {
      rates: false,
      historical: true,
      conversion: false
    },
    error: {
      rates: null,
      historical: 'Some error',
      conversion: null
    }
  };

  const appState = {
    exchangeRate: mockState
  };

  describe('selectCurrentRates', () => {
    it('should select current rates', () => {
      const result = ExchangeRateSelectors.selectCurrentRates.projector(mockState);
      expect(result).toEqual(mockState.currentRates);
    });
  });

  describe('selectConversionResult', () => {
    it('should select conversion result', () => {
      const result = ExchangeRateSelectors.selectConversionResult.projector(mockState);
      expect(result).toEqual(mockConversionResult);
    });
  });

  describe('selectExchangeRateLoading', () => {
    it('should select loading state', () => {
      const result = ExchangeRateSelectors.selectExchangeRateLoading.projector(mockState);
      expect(result).toEqual(mockState.loading);
    });
  });

  describe('selectExchangeRateErrors', () => {
    it('should select error state', () => {
      const result = ExchangeRateSelectors.selectExchangeRateErrors.projector(mockState);
      expect(result).toEqual(mockState.error);
    });
  });
});