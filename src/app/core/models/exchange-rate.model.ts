export interface ExchangeRateData {
  BTC: number;
  CAD: number;
  EUR: number;
  GBP: number;
  GHS: number;
  NGN: number;
  USD: number;
}

export interface ExchangeRateResponse {
  base: string;
  rates: ExchangeRateData;
  date: string;
  success: boolean;
  timestamp: number;
}

export interface HistoricalDataPoint {
  date: string;
  rate: number;
  timestamp: number;
}

export interface HistoricalRateData {
  currency: string;
  baseCurrency: string;
  data: HistoricalDataPoint[];
  period: TimePeriod;
}

export interface ChartDataset {
  label: string;
  data: { x: string; y: number }[];
  borderColor?: string;
  backgroundColor?: string;
  fill?: boolean;
}

export type TimePeriod = '1D' | '30D' | '6M' | '1Y';

export interface TimePeriodOption {
  value: TimePeriod;
  label: string;
  days: number;
}

export interface ConversionResult {
  success: boolean;
  query: {
    from: string;
    to: string;
    amount: number;
  };
  info: {
    timestamp: number;
    rate: number;
  };
  result: number;
}
