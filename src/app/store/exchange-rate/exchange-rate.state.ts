import { ExchangeRateResponse, HistoricalRateData, ConversionResult } from '../../core/models/exchange-rate.model';

export interface ExchangeRateState {
  currentRates: ExchangeRateResponse | null;
  historicalData: HistoricalRateData[] | null;
  conversionResult: ConversionResult | null;
  loading: {
    rates: boolean;
    historical: boolean;
    conversion: boolean;
  };
  error: {
    rates: string | null;
    historical: string | null;
    conversion: string | null;
  };
}

export const initialExchangeRateState: ExchangeRateState = {
  currentRates: null,
  historicalData: null,
  conversionResult: null,
  loading: {
    rates: false,
    historical: false,
    conversion: false,
  },
  error: {
    rates: null,
    historical: null,
    conversion: null,
  },
};