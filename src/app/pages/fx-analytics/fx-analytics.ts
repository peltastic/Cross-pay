import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, filter, map } from 'rxjs/operators';
import { ExchangeRateService } from '../../core/services/exchange-rate.service';
import { DashboardLayout } from '../../layout/dashboard-layout/dashboard-layout';
import {
  DataTableComponent,
  DataTableColumn,
} from '../../shared/components/ui/data-table/data-table';
import { SelectComponent } from '../../shared/components/ui/select/select';
import {
  LineChartComponent,
  LineChartData,
} from '../../shared/components/ui/line-chart/line-chart';
import {
  ExchangeRateResponse,
  HistoricalRateData,
  TimePeriod,
  TimePeriodOption,
} from '../../core/models/exchange-rate.model';
import { SUPPORTED_CURRENCIES_FULL } from '../../core/constants/currencies';
import * as ExchangeRateActions from '../../store/exchange-rate/exchange-rate.actions';
import * as ExchangeRateSelectors from '../../store/exchange-rate/exchange-rate.selector';

@Component({
  selector: 'app-fx-analytics',
  imports: [
    DashboardLayout,
    DataTableComponent,
    SelectComponent,
    LineChartComponent,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './fx-analytics.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FxAnalytics implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  exchangeRates$: Observable<any[]>;
  
  chartLoading$: Observable<boolean>;
  chartError$: Observable<string | null>;
  chartData$: Observable<LineChartData[]>;
  
  selectedBaseCurrency = 'USD';
  selectedPeriod: TimePeriod = '30D';
  selectedChartBaseCurrency = 'USD';
  selectedTargetCurrency = 'NGN';

  timePeriods: TimePeriodOption[] = [];

  currencyOptions = SUPPORTED_CURRENCIES_FULL.map((currency: any) => ({
    value: currency.code,
    label: `${currency.code} - ${currency.name}`,
  }));

  baseCurrencyOptions = SUPPORTED_CURRENCIES_FULL.map((currency: any) => ({
    value: currency.code,
    label: `${currency.code} - ${currency.name}`,
  }));

  targetCurrencyOptions = SUPPORTED_CURRENCIES_FULL.map((currency: any) => ({
    value: currency.code,
    label: `${currency.code} - ${currency.name}`,
  }));

  columns: DataTableColumn[] = [
    { key: 'currency', header: 'Currency' },
    { key: 'rate', header: 'Exchange Rate' },
  ];

  constructor(
    private exchangeRateService: ExchangeRateService,
    private store: Store
  ) {
    this.timePeriods = this.exchangeRateService.getTimePeriods();
    
    this.loading$ = this.store.select(ExchangeRateSelectors.selectRatesLoading);
    this.error$ = this.store.select(ExchangeRateSelectors.selectRatesError);
    this.chartLoading$ = this.store.select(ExchangeRateSelectors.selectHistoricalLoading);
    this.chartError$ = this.store.select(ExchangeRateSelectors.selectHistoricalError);
    
    this.exchangeRates$ = this.store.select(ExchangeRateSelectors.selectCurrentRates)
      .pipe(
        filter(Boolean),
        map(response => this.transformRatesData(response))
      );
      
    this.chartData$ = this.getChartData$();
  }

  ngOnInit(): void {
    this.loadExchangeRates();
    this.loadHistoricalData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onBaseCurrencyChange(baseCurrency: string): void {
    this.selectedBaseCurrency = baseCurrency;
    this.loadExchangeRates();
    this.updateExchangeRatesObservable();
  }

  onTargetCurrencyChange(targetCurrency: string): void {
    this.selectedTargetCurrency = targetCurrency;
    this.loadHistoricalData();
    this.updateChartDataObservable();
  }

  onChartBaseCurrencyChange(baseCurrency: string): void {
    this.selectedChartBaseCurrency = baseCurrency;
    this.loadHistoricalData();
    this.updateChartDataObservable();
  }

  onPeriodClick(period: TimePeriod): void {
    this.selectedPeriod = period;
    this.loadHistoricalData();
    this.updateChartDataObservable();
  }

  private loadExchangeRates(): void {
    this.store.dispatch(ExchangeRateActions.loadLatestRates({ 
      baseCurrency: this.selectedBaseCurrency 
    }));
  }

  private loadHistoricalData(): void {
    if (this.selectedChartBaseCurrency === this.selectedTargetCurrency) {
      return;
    }

    this.store.dispatch(ExchangeRateActions.loadHistoricalRates({
      targetCurrencies: [this.selectedTargetCurrency],
      baseCurrency: this.selectedChartBaseCurrency,
      period: this.selectedPeriod
    }));
  }

  private updateExchangeRatesObservable(): void {
    this.exchangeRates$ = this.store.select(ExchangeRateSelectors.selectCurrentRates)
      .pipe(
        filter(Boolean),
        map(response => this.transformRatesData(response))
      );
  }

  private updateChartDataObservable(): void {
    this.chartData$ = this.getChartDataObservable();
  }

  private getChartDataObservable(): Observable<LineChartData[]> {
    return this.store.select(ExchangeRateSelectors.selectHistoricalData).pipe(
      map(historicalData => {
        if (historicalData && historicalData.length > 0) {
          return this.transformHistoricalDataForChart(historicalData);
        }
        return this.generateMockChartData();
      })
    );
  }

  private transformHistoricalDataForChart(historicalData: HistoricalRateData[]): LineChartData[] {
    return historicalData.map((dataset, index) => ({
      label: `${dataset.currency}/${dataset.baseCurrency}`,
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

  private transformRatesData(response: ExchangeRateResponse): any[] {
    if (!response.rates) return [];

    return Object.entries(response.rates).map(([currency, rate]) => {
      const currencyInfo = SUPPORTED_CURRENCIES_FULL.find((c: any) => c.code === currency);
      const symbol = currencyInfo?.symbol || '';
      const formattedRate = typeof rate === 'number' ? rate : rate;
      return {
        currency: currency,
        rate: `${symbol}${formattedRate}`,
      };
    });
  }

  private generateMockChartData(): LineChartData[] {
    const generateMockData = (base: number, days: number = 30) => {
      const data = [];
      const maxPoints = 8;
      const step = Math.floor(days / (maxPoints - 1));
      for (let i = 0; i < maxPoints; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i * step));
        const variation = (Math.random() - 0.5) * 20;
        data.push({
          x: date.toISOString().split('T')[0],
          y: base + variation,
        });
      }
      return data;
    };

    return [
      {
        label: `${this.selectedTargetCurrency}/${this.selectedChartBaseCurrency}`,
        data: generateMockData(
          850,
          this.timePeriods?.find((p) => p.value === this.selectedPeriod)?.days || 30
        ),
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: false,
      },
    ];
  }

  private getChartData$(): Observable<LineChartData[]> {
    return this.getChartDataObservable();
  }
}
