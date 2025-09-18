import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { ExchangeRateEffects } from './exchange-rate.effects';
import { ExchangeRateService } from '../../core/services/exchange-rate.service';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import * as ExchangeRateActions from './exchange-rate.actions';
import * as ErrorActions from '../error/error.actions';
import { ExchangeRateResponse, ConversionResult, HistoricalRateData } from '../../core/models/exchange-rate.model';
import { TestScheduler } from 'rxjs/testing';

describe('ExchangeRateEffects', () => {
  let actions$: Observable<any>;
  let effects: ExchangeRateEffects;
  let exchangeRateService: jasmine.SpyObj<ExchangeRateService>;
  let store: MockStore;
  let testScheduler: TestScheduler;

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

  const mockHistoricalData: HistoricalRateData[] = [{
    currency: 'NGN',
    baseCurrency: 'USD',
    data: [
      { date: '2025-09-18', rate: 1650.0, timestamp: 1726675200 },
      { date: '2025-09-17', rate: 1649.5, timestamp: 1726588800 }
    ],
    period: '30D'
  }];

  beforeEach(() => {
    const exchangeRateServiceSpy = jasmine.createSpyObj('ExchangeRateService', [
      'getLatestRates',
      'convertCurrency',
      'getHistoricalRatesForMultipleCurrencies'
    ]);

    TestBed.configureTestingModule({
      providers: [
        ExchangeRateEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        { provide: ExchangeRateService, useValue: exchangeRateServiceSpy }
      ]
    });

    effects = TestBed.inject(ExchangeRateEffects);
    exchangeRateService = TestBed.inject(ExchangeRateService) as jasmine.SpyObj<ExchangeRateService>;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');

    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  describe('loadLatestRates$', () => {
    it('should load latest rates successfully', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        const action = ExchangeRateActions.loadLatestRates({ baseCurrency: 'USD' });
        const expectedAction = ExchangeRateActions.loadLatestRatesSuccess({ 
          baseCurrency: 'USD',
          data: mockExchangeRateResponse 
        });

        exchangeRateService.getLatestRates.and.returnValue(of(mockExchangeRateResponse));
        
        actions$ = hot('-a', { a: action });
        const expected = cold('-b', { b: expectedAction });

        expectObservable(effects.loadLatestRates$).toBe('-b', { b: expectedAction });
      });
    });

    it('should handle load latest rates failure', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        const action = ExchangeRateActions.loadLatestRates({ baseCurrency: 'USD' });
        const error = new Error('Network error');
        
        exchangeRateService.getLatestRates.and.returnValue(throwError(() => error));
        
        actions$ = hot('-a', { a: action });

        effects.loadLatestRates$.subscribe({
          next: (result) => {
            expect(result.type).toBe('[Exchange Rate] Load Latest Rates Failure');
            expect(store.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({
              type: '[Error] Add Error'
            }));
          }
        });
      });
    });
  });

  describe('convertCurrency$', () => {
    it('should convert currency successfully', () => {
      const action = ExchangeRateActions.convertCurrency({
        from: 'USD',
        to: 'NGN',
        amount: 100
      });

      exchangeRateService.convertCurrency.and.returnValue(of(mockConversionResult));
      actions$ = of(action);

      effects.convertCurrency$.subscribe(result => {
        expect(result.type).toBe('[Exchange Rate] Convert Currency Success');
        if (result.type === '[Exchange Rate] Convert Currency Success') {
          expect(result.data).toEqual(mockConversionResult);
        }
      });
    });

    it('should handle convert currency failure', () => {
      const action = ExchangeRateActions.convertCurrency({
        from: 'USD',
        to: 'NGN',
        amount: 100
      });
      const error = new Error('Conversion failed');

      exchangeRateService.convertCurrency.and.returnValue(throwError(() => error));
      actions$ = of(action);

      effects.convertCurrency$.subscribe(result => {
        expect(result.type).toBe('[Exchange Rate] Convert Currency Failure');
        expect(store.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({
          type: '[Error] Add Error'
        }));
      });
    });
  });
});