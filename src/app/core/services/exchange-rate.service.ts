import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of } from 'rxjs';
import { EnvironmentService } from './environment.service';
import {
  ExchangeRateResponse,
  HistoricalDataPoint,
  HistoricalRateData,
  TimePeriod,
  TimePeriodOption,
} from '../models/exchange-rate.model';
import { SUPPORTED_CURRENCIES_SHORT } from '../constants/currencies';

@Injectable({
  providedIn: 'root',
})
export class ExchangeRateService {
  public readonly TIME_PERIODS: TimePeriodOption[] = [
    { value: '1D', label: '1 Day', days: 1 },
    { value: '30D', label: '30 Days', days: 30 },
    { value: '6M', label: '6 Months', days: 180 },
    { value: '1Y', label: '1 Year', days: 365 },
  ];

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {}

  getLatestRates(baseCurrency: string = 'NGN'): Observable<ExchangeRateResponse> {
    const url = `${this.environmentService.exchangeRateApiUrl}/latest?access_key=${
      this.environmentService.exchangeRateApiKey
    }&base=${baseCurrency}&symbols=${SUPPORTED_CURRENCIES_SHORT.join(',')}`;
    return this.http.get<ExchangeRateResponse>(url);
  }

  convertCurrency(from: string, to: string, amount: number): Observable<any> {
    const url = `${this.environmentService.exchangeRateApiUrl}/convert?access_key=${this.environmentService.exchangeRateApiKey}&from=${from}&to=${to}&amount=${amount}`;
    return this.http.get<any>(url);
  }

  getTimesSeriesRates(): Observable<any> {
    const url = `${this.environmentService.exchangeRateApiUrl}/2023-05-06?access_key=${
      this.environmentService.exchangeRateApiKey
    }&base=NGN&symbols=${SUPPORTED_CURRENCIES_SHORT.join(',')}`;
    return this.http.get<any>(url);
  }
  getHistoricalRates(date: string, baseCurrency: string = 'NGN'): Observable<ExchangeRateResponse> {
    const url = `${this.environmentService.exchangeRateApiUrl}/${date}?access_key=${
      this.environmentService.exchangeRateApiKey
    }&base=${baseCurrency}&symbols=${SUPPORTED_CURRENCIES_SHORT.join(',')}`;
    return this.http.get<ExchangeRateResponse>(url);
  }

  private generateDateRange(days: number): string[] {
    const dates: string[] = [];
    const maxPoints = 8;
    const step = Math.floor(days / (maxPoints - 1));

    for (let i = 0; i < maxPoints; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i * step));
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }

  getHistoricalRatesForPeriod(
    targetCurrency: string,
    baseCurrency: string = 'NGN',
    period: TimePeriod = '30D'
  ): Observable<HistoricalRateData> {
    const periodConfig = this.TIME_PERIODS.find((p) => p.value === period);
    const days = periodConfig?.days || 30;

    const dates = this.generateDateRange(days);

    const requests = dates.map((date) =>
      this.getHistoricalRates(date, baseCurrency).pipe(
        map(
          (response) =>
            ({
              date,
              rate: response.rates
                ? response.rates[targetCurrency as keyof typeof response.rates] || 0
                : 0,
              timestamp: new Date(date).getTime(),
            } as HistoricalDataPoint)
        ),
        catchError((error) => {
          return of({
            date,
            rate: 0,
            timestamp: new Date(date).getTime(),
          } as HistoricalDataPoint);
        })
      )
    );

    return forkJoin(requests).pipe(
      map((dataPoints) => {
        const validDataPoints = dataPoints.filter((point) => point.rate > 0);

        if (validDataPoints.length === 0) {
          throw new Error(
            `No valid exchange rate data found for ${targetCurrency}/${baseCurrency} pair`
          );
        }

        return {
          currency: targetCurrency,
          baseCurrency,
          data: validDataPoints,
          period,
        } as HistoricalRateData;
      }),
      catchError((error) => {
        throw error;
      })
    );
  }

  getHistoricalRatesForMultipleCurrencies(
    targetCurrencies: string[],
    baseCurrency: string = 'NGN',
    period: TimePeriod = '30D'
  ): Observable<HistoricalRateData[]> {
    const requests = targetCurrencies.map((currency) =>
      this.getHistoricalRatesForPeriod(currency, baseCurrency, period)
    );

    return forkJoin(requests);
  }

  getTimePeriods(): TimePeriodOption[] {
    return this.TIME_PERIODS;
  }

  formatDataForChart(historicalData: HistoricalRateData[]): any[] {
    return historicalData.map((dataset) => ({
      label: `${dataset.currency} (${dataset.baseCurrency})`,
      data: dataset.data.map((point) => ({
        x: point.date,
        y: point.rate,
      })),
      borderColor: this.getCurrencyColor(dataset.currency),
      backgroundColor: this.getCurrencyColor(dataset.currency, 0.1),
      fill: false,
    }));
  }

  private getCurrencyColor(currency: string, alpha: number = 1): string {
    const colorMap: { [key: string]: string } = {
      USD: `rgba(34, 197, 94, ${alpha})`,
      EUR: `rgba(59, 130, 246, ${alpha})`,
      GBP: `rgba(168, 85, 247, ${alpha})`,
      BTC: `rgba(251, 191, 36, ${alpha})`,
      CAD: `rgba(239, 68, 68, ${alpha})`,
      GHS: `rgba(20, 184, 166, ${alpha})`,
      NGN: `rgba(107, 114, 128, ${alpha})`,
      JPY: `rgba(255, 165, 0, ${alpha})`,
    };

    return colorMap[currency] || `rgba(156, 163, 175, ${alpha})`;
  }
}
