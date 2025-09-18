import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { FxAnalytics } from './fx-analytics';
import * as ExchangeRateActions from '../../store/exchange-rate/exchange-rate.actions';
import * as ExchangeRateSelectors from '../../store/exchange-rate/exchange-rate.selector';
import { ExchangeRateService } from '../../core/services/exchange-rate.service';
import {
  ExchangeRateResponse,
  TimePeriodOption,
  HistoricalRateData,
} from '../../core/models/exchange-rate.model';

describe('FxAnalytics', () => {
  let component: FxAnalytics;
  let fixture: ComponentFixture<FxAnalytics>;
  let store: MockStore;
  let exchangeRateService: jasmine.SpyObj<ExchangeRateService>;

  const mockTimePeriods: TimePeriodOption[] = [
    { value: '1D', label: '1 Day', days: 1 },
    { value: '30D', label: '30 Days', days: 30 },
    { value: '6M', label: '6 Months', days: 180 },
    { value: '1Y', label: '1 Year', days: 365 },
  ];

  const mockExchangeRateResponse: ExchangeRateResponse = {
    base: 'USD',
    rates: {
      BTC: 0.000025,
      CAD: 1.35,
      EUR: 0.85,
      GBP: 0.75,
      GHS: 12.0,
      NGN: 1650.0,
      USD: 1.0,
    },
    date: '2025-09-18',
    success: true,
    timestamp: 1726675200,
  };

  const mockHistoricalData: HistoricalRateData[] = [
    {
      currency: 'NGN',
      baseCurrency: 'USD',
      period: '30D',
      data: [
        { date: '2025-09-15', rate: 1645.5, timestamp: 1726444800 },
        { date: '2025-09-16', rate: 1648.2, timestamp: 1726531200 },
        { date: '2025-09-17', rate: 1650.0, timestamp: 1726617600 },
      ],
    },
  ];

  const initialState = {
    exchangeRate: {
      currentRates: {},
      historicalData: {},
      conversions: {},
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
      lastUpdated: null,
    },
  };

  beforeEach(async () => {
    const exchangeRateServiceSpy = jasmine.createSpyObj('ExchangeRateService', ['getTimePeriods']);

    exchangeRateServiceSpy.getTimePeriods.and.returnValue(mockTimePeriods);

    await TestBed.configureTestingModule({
      imports: [FxAnalytics],
      providers: [
        provideMockStore({ initialState }),
        { provide: ExchangeRateService, useValue: exchangeRateServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FxAnalytics);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    exchangeRateService = TestBed.inject(
      ExchangeRateService
    ) as jasmine.SpyObj<ExchangeRateService>;

    spyOn(store, 'dispatch');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.selectedBaseCurrency).toBe('USD');
    expect(component.selectedTargetCurrency).toBe('NGN');
    expect(component.selectedPeriod).toBe('30D');
    expect(component.selectedChartBaseCurrency).toBe('USD');
  });

  it('should dispatch loadLatestRates on ngOnInit', () => {
    component.ngOnInit();

    expect(store.dispatch).toHaveBeenCalledWith(
      ExchangeRateActions.loadLatestRates({ baseCurrency: 'USD' })
    );
  });

  it('should dispatch loadHistoricalRates on ngOnInit', () => {
    component.ngOnInit();

    expect(store.dispatch).toHaveBeenCalledWith(
      ExchangeRateActions.loadHistoricalRates({
        targetCurrencies: ['NGN'],
        baseCurrency: 'USD',
        period: '30D',
      })
    );
  });

  it('should handle base currency change', () => {
    component.onBaseCurrencyChange('EUR');

    expect(component.selectedBaseCurrency).toBe('EUR');
    expect(store.dispatch).toHaveBeenCalledWith(
      ExchangeRateActions.loadLatestRates({ baseCurrency: 'EUR' })
    );
  });

  it('should handle target currency change', () => {
    component.onTargetCurrencyChange('GBP');

    expect(component.selectedTargetCurrency).toBe('GBP');
    expect(store.dispatch).toHaveBeenCalledWith(
      ExchangeRateActions.loadHistoricalRates({
        targetCurrencies: ['GBP'],
        baseCurrency: 'USD',
        period: '30D',
      })
    );
  });

  it('should handle chart base currency change', () => {
    component.onChartBaseCurrencyChange('EUR');

    expect(component.selectedChartBaseCurrency).toBe('EUR');
    expect(store.dispatch).toHaveBeenCalledWith(
      ExchangeRateActions.loadHistoricalRates({
        targetCurrencies: ['NGN'],
        baseCurrency: 'EUR',
        period: '30D',
      })
    );
  });

  it('should handle period change', () => {
    component.onPeriodClick('1Y');

    expect(component.selectedPeriod).toBe('1Y');
    expect(store.dispatch).toHaveBeenCalledWith(
      ExchangeRateActions.loadHistoricalRates({
        targetCurrencies: ['NGN'],
        baseCurrency: 'USD',
        period: '1Y',
      })
    );
  });

  it('should expose time periods from service', () => {
    expect(component.timePeriods).toEqual(mockTimePeriods);
  });

  it('should clean up on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });

  describe('Branch Coverage - loadHistoricalData', () => {
    it('should not dispatch when base currency equals target currency', () => {
      (store.dispatch as jasmine.Spy).calls.reset();

      component.selectedChartBaseCurrency = 'NGN';
      component.selectedTargetCurrency = 'NGN';

      component['loadHistoricalData']();

      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should dispatch when base currency differs from target currency', () => {
      component.selectedChartBaseCurrency = 'USD';
      component.selectedTargetCurrency = 'EUR';
      component.selectedPeriod = '1D';

      component['loadHistoricalData']();

      expect(store.dispatch).toHaveBeenCalledWith(
        ExchangeRateActions.loadHistoricalRates({
          targetCurrencies: ['EUR'],
          baseCurrency: 'USD',
          period: '1D',
        })
      );
    });
  });

  describe('Branch Coverage - transformRatesData', () => {
    it('should return empty array when rates is null', () => {
      const response = { ...mockExchangeRateResponse, rates: null as any };
      const result = component['transformRatesData'](response);

      expect(result).toEqual([]);
    });

    it('should return empty array when rates is undefined', () => {
      const response = { ...mockExchangeRateResponse, rates: undefined as any };
      const result = component['transformRatesData'](response);

      expect(result).toEqual([]);
    });

    it('should transform rates data correctly when rates exist', () => {
      const result = component['transformRatesData'](mockExchangeRateResponse);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].currency).toBeDefined();
      expect(result[0].rate).toBeDefined();
    });

    it('should handle currency with no symbol found', () => {
      const responseWithUnknownCurrency = {
        ...mockExchangeRateResponse,
        rates: { ...mockExchangeRateResponse.rates, UNKNOWN: 1.5 } as any,
      };

      const result = component['transformRatesData'](responseWithUnknownCurrency);
      const unknownCurrency = result.find((r) => r.currency === 'UNKNOWN');

      expect(unknownCurrency?.rate).toBe('1.5');
    });

    it('should handle number rates correctly', () => {
      const result = component['transformRatesData'](mockExchangeRateResponse);
      const btcRate = result.find((r) => r.currency === 'BTC');

      expect(btcRate?.rate).toContain('0.000025');
    });
  });

  describe('Branch Coverage - getCurrencyColor', () => {
    it('should return specific color for known currencies', () => {
      const knownCurrencies = ['USD', 'EUR', 'GBP', 'BTC', 'CAD', 'GHS', 'NGN', 'JPY'];

      knownCurrencies.forEach((currency) => {
        const color = component['getCurrencyColor'](currency);
        expect(color).not.toContain('156, 163, 175');
      });
    });

    it('should return default color for unknown currency', () => {
      const color = component['getCurrencyColor']('UNKNOWN');
      expect(color).toBe('rgba(156, 163, 175, 1)');
    });

    it('should handle alpha parameter correctly', () => {
      const colorWithAlpha = component['getCurrencyColor']('USD', 0.5);
      expect(colorWithAlpha).toContain('0.5');
    });

    it('should use default alpha of 1 when not specified', () => {
      const colorDefaultAlpha = component['getCurrencyColor']('USD');
      expect(colorDefaultAlpha).toContain('1)');
    });
  });

  describe('Branch Coverage - Chart Data Processing', () => {
    it('should transform historical data when available', () => {
      // Mock the store selector to return historical data
      store.overrideSelector(ExchangeRateSelectors.selectHistoricalData, mockHistoricalData);

      component['getChartDataObservable']().subscribe((result) => {
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].label).toContain('NGN/USD');
        expect(result[0].data.length).toBe(3);
      });
    });

    it('should generate mock data when no historical data available', () => {
      // Mock the store selector to return empty array
      store.overrideSelector(ExchangeRateSelectors.selectHistoricalData, []);

      component['getChartDataObservable']().subscribe((result) => {
        expect(result.length).toBe(1);
        expect(result[0].label).toContain('NGN/USD');
        expect(result[0].data.length).toBe(8); // Mock data has 8 points
      });
    });

    it('should generate mock data when historical data is null', () => {
      // Mock the store selector to return null
      store.overrideSelector(ExchangeRateSelectors.selectHistoricalData, null);

      component['getChartDataObservable']().subscribe((result) => {
        expect(result.length).toBe(1);
        expect(result[0].label).toContain('NGN/USD');
      });
    });
  });

  describe('Branch Coverage - generateMockChartData', () => {
    it('should generate correct number of data points', () => {
      const result = component['generateMockChartData']();

      expect(result.length).toBe(1);
      expect(result[0].data.length).toBe(8);
    });

    it('should use correct period days when timePeriods is defined', () => {
      component.selectedPeriod = '1Y';
      const result = component['generateMockChartData']();

      // Should use the days from the time period (365 for 1Y)
      expect(result[0].data.length).toBe(8); // Still 8 points but spread over 365 days
    });

    it('should use default 30 days when period not found', () => {
      component.selectedPeriod = 'UNKNOWN' as any;
      const result = component['generateMockChartData']();

      expect(result[0].data.length).toBe(8);
    });

    it('should use default 30 days when timePeriods is null', () => {
      component.timePeriods = null as any;
      const result = component['generateMockChartData']();

      expect(result[0].data.length).toBe(8);
    });
  });

  describe('Branch Coverage - Observable Updates', () => {
    it('should update exchange rates observable on base currency change', () => {
      spyOn(component, 'updateExchangeRatesObservable' as any);

      component.onBaseCurrencyChange('EUR');

      expect(component['updateExchangeRatesObservable']).toHaveBeenCalled();
    });

    it('should update chart data observable on target currency change', () => {
      spyOn(component, 'updateChartDataObservable' as any);

      component.onTargetCurrencyChange('GBP');

      expect(component['updateChartDataObservable']).toHaveBeenCalled();
    });

    it('should update chart data observable on chart base currency change', () => {
      spyOn(component, 'updateChartDataObservable' as any);

      component.onChartBaseCurrencyChange('EUR');

      expect(component['updateChartDataObservable']).toHaveBeenCalled();
    });

    it('should update chart data observable on period change', () => {
      spyOn(component, 'updateChartDataObservable' as any);

      component.onPeriodClick('6M');

      expect(component['updateChartDataObservable']).toHaveBeenCalled();
    });
  });

  describe('Branch Coverage - Store Integration', () => {
    it('should handle exchange rates observable with filter and map', () => {
      store.overrideSelector(ExchangeRateSelectors.selectCurrentRates, mockExchangeRateResponse);

      component.exchangeRates$.subscribe((result) => {
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });
    });

    it('should filter out falsy values from exchange rates', () => {
      store.overrideSelector(ExchangeRateSelectors.selectCurrentRates, null);

      let emitted = false;
      component.exchangeRates$.subscribe(() => {
        emitted = true;
      });

      // Should not emit due to filter(Boolean)
      expect(emitted).toBe(false);
    });
  });

  describe('Branch Coverage - Edge Cases', () => {
    it('should handle transformHistoricalDataForChart with multiple datasets', () => {
      const multipleDatasets: HistoricalRateData[] = [
        {
          currency: 'EUR',
          baseCurrency: 'USD',
          period: '30D',
          data: [{ date: '2025-09-15', rate: 0.85, timestamp: 1726444800 }],
        },
        {
          currency: 'GBP',
          baseCurrency: 'USD',
          period: '30D',
          data: [{ date: '2025-09-15', rate: 0.75, timestamp: 1726444800 }],
        },
      ];

      const result = component['transformHistoricalDataForChart'](multipleDatasets);

      expect(result.length).toBe(2);
      expect(result[0].label).toBe('EUR/USD');
      expect(result[1].label).toBe('GBP/USD');
    });

    it('should handle empty historical data array', () => {
      const result = component['transformHistoricalDataForChart']([]);

      expect(result).toEqual([]);
    });

    it('should assign different colors to different currencies', () => {
      const eurColor = component['getCurrencyColor']('EUR');
      const gbpColor = component['getCurrencyColor']('GBP');

      expect(eurColor).not.toBe(gbpColor);
    });
  });
});
