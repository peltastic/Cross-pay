import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ExchangeRateService } from './exchange-rate.service';
import { EnvironmentService } from './environment.service';
import { ExchangeRateResponse, HistoricalDataPoint, TimePeriod, HistoricalRateData } from '../models/exchange-rate.model';

describe('ExchangeRateService', () => {
  let service: ExchangeRateService;
  let httpMock: HttpTestingController;
  let mockEnvironmentService: jasmine.SpyObj<EnvironmentService>;

  const mockExchangeRateResponse: ExchangeRateResponse = {
    success: true,
    timestamp: 1234567890,
    base: 'NGN',
    date: '2023-05-06',
    rates: {
      USD: 0.0022,
      EUR: 0.0020,
      GBP: 0.0018,
      CAD: 0.0030,
      GHS: 0.025,
      BTC: 0.00000008,
      NGN: 1.0
    }
  };

  beforeEach(() => {
    const environmentSpy = jasmine.createSpyObj('EnvironmentService', [], {
      exchangeRateApiUrl: 'https://api.exchangerate.com',
      exchangeRateApiKey: 'test-api-key'
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ExchangeRateService,
        { provide: EnvironmentService, useValue: environmentSpy }
      ]
    });

    service = TestBed.inject(ExchangeRateService);
    httpMock = TestBed.inject(HttpTestingController);
    mockEnvironmentService = TestBed.inject(EnvironmentService) as jasmine.SpyObj<EnvironmentService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('TIME_PERIODS constant', () => {
    it('should have correct time periods', () => {
      expect(service.TIME_PERIODS).toEqual([
        { value: '1D', label: '1 Day', days: 1 },
        { value: '30D', label: '30 Days', days: 30 },
        { value: '6M', label: '6 Months', days: 180 },
        { value: '1Y', label: '1 Year', days: 365 },
      ]);
    });
  });

  describe('getLatestRates', () => {
    it('should fetch latest rates with default base currency', () => {
      service.getLatestRates().subscribe(response => {
        expect(response).toEqual(mockExchangeRateResponse);
      });

      const req = httpMock.expectOne(
        'https://api.exchangerate.com/latest?access_key=test-api-key&base=NGN&symbols=USD,EUR,GBP,NGN,JPY,CAD,GHS,BTC'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockExchangeRateResponse);
    });

    it('should fetch latest rates with custom base currency', () => {
      service.getLatestRates('USD').subscribe(response => {
        expect(response).toEqual(mockExchangeRateResponse);
      });

      const req = httpMock.expectOne(
        'https://api.exchangerate.com/latest?access_key=test-api-key&base=USD&symbols=USD,EUR,GBP,NGN,JPY,CAD,GHS,BTC'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockExchangeRateResponse);
    });

    it('should handle HTTP errors', () => {
      service.getLatestRates().subscribe({
        next: () => fail('should have failed'),
        error: (error) => expect(error).toBeTruthy()
      });

      const req = httpMock.expectOne(req => req.url.includes('/latest'));
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('convertCurrency', () => {
    const mockConvertResponse = {
      success: true,
      query: { from: 'USD', to: 'NGN', amount: 100 },
      info: { timestamp: 1234567890, rate: 450.25 },
      result: 45025
    };

    it('should convert currency successfully', () => {
      service.convertCurrency('USD', 'NGN', 100).subscribe(response => {
        expect(response).toEqual(mockConvertResponse);
      });

      const req = httpMock.expectOne(
        'https://api.exchangerate.com/convert?access_key=test-api-key&from=USD&to=NGN&amount=100'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockConvertResponse);
    });

    it('should handle zero amount conversion', () => {
      service.convertCurrency('USD', 'EUR', 0).subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(req => req.url.includes('amount=0'));
      expect(req.request.method).toBe('GET');
      req.flush({ ...mockConvertResponse, result: 0 });
    });

    it('should handle negative amount conversion', () => {
      service.convertCurrency('EUR', 'USD', -50).subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(req => req.url.includes('amount=-50'));
      expect(req.request.method).toBe('GET');
      req.flush({ ...mockConvertResponse, result: -50 });
    });
  });

  describe('getTimesSeriesRates', () => {
    it('should fetch time series rates', () => {
      const mockTimeSeriesResponse = {
        success: true,
        timeseries: true,
        start_date: '2023-05-06',
        end_date: '2023-05-06',
        base: 'NGN',
        rates: {
          '2023-05-06': {
            USD: 0.0022,
            EUR: 0.0020
          }
        }
      };

      service.getTimesSeriesRates().subscribe(response => {
        expect(response).toEqual(mockTimeSeriesResponse);
      });

      const req = httpMock.expectOne(
        'https://api.exchangerate.com/2023-05-06?access_key=test-api-key&base=NGN&symbols=USD,EUR,GBP,NGN,JPY,CAD,GHS,BTC'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockTimeSeriesResponse);
    });
  });

  describe('getHistoricalRates', () => {
    it('should fetch historical rates with default base currency', () => {
      service.getHistoricalRates('2023-05-06').subscribe(response => {
        expect(response).toEqual(mockExchangeRateResponse);
      });

      const req = httpMock.expectOne(
        'https://api.exchangerate.com/2023-05-06?access_key=test-api-key&base=NGN&symbols=USD,EUR,GBP,NGN,JPY,CAD,GHS,BTC'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockExchangeRateResponse);
    });

    it('should fetch historical rates with custom base currency', () => {
      service.getHistoricalRates('2023-01-01', 'EUR').subscribe(response => {
        expect(response).toEqual(mockExchangeRateResponse);
      });

      const req = httpMock.expectOne(
        'https://api.exchangerate.com/2023-01-01?access_key=test-api-key&base=EUR&symbols=USD,EUR,GBP,NGN,JPY,CAD,GHS,BTC'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockExchangeRateResponse);
    });
  });

  describe('getHistoricalRatesForPeriod', () => {
    it('should fetch and format historical data for a specific period', () => {
      service.getHistoricalRatesForPeriod('USD', 'NGN', '1D').subscribe(response => {
        expect(response.currency).toBe('USD');
        expect(response.baseCurrency).toBe('NGN');
        expect(response.period).toBe('1D');
        expect(response.data).toBeDefined();
        expect(Array.isArray(response.data)).toBe(true);
      });

      // Expect multiple requests for historical data points
      const reqs = httpMock.match(req => req.url.includes('access_key=test-api-key'));
      expect(reqs.length).toBeGreaterThan(0);
      
      reqs.forEach(req => {
        req.flush(mockExchangeRateResponse);
      });
    });

    it('should handle empty periods array', () => {
      service.getHistoricalRatesForPeriod('USD', 'NGN', '30D').subscribe(response => {
        expect(response.currency).toBe('USD');
      });

      const reqs = httpMock.match(req => req.url.includes('access_key'));
      reqs.forEach(req => req.flush(mockExchangeRateResponse));
    });

    it('should handle single period', () => {
      service.getHistoricalRatesForPeriod('EUR', 'USD', '6M').subscribe(response => {
        expect(response.period).toBe('6M');
      });

      const reqs = httpMock.match(req => req.url.includes('access_key=test-api-key'));
      reqs.forEach(req => req.flush(mockExchangeRateResponse));
    });
  });

  describe('getHistoricalRatesForMultipleCurrencies', () => {
    it('should fetch historical data for multiple currencies', () => {
      service.getHistoricalRatesForMultipleCurrencies(['USD', 'EUR'], 'NGN', '1D').subscribe(response => {
        expect(Array.isArray(response)).toBe(true);
        expect(response.length).toBe(2);
      });

      const reqs = httpMock.match(req => req.url.includes('access_key=test-api-key'));
      reqs.forEach(req => req.flush(mockExchangeRateResponse));
    });
  });

  describe('formatDataForChart', () => {
    it('should format historical data for chart display', () => {
      const mockHistoricalData: HistoricalRateData[] = [
        {
          currency: 'USD',
          baseCurrency: 'NGN',
          data: [
            { date: '2023-05-01', rate: 0.0022, timestamp: 123456789 },
            { date: '2023-05-02', rate: 0.0023, timestamp: 123456790 }
          ],
          period: '1D'
        }
      ];

      const chartData = service.formatDataForChart(mockHistoricalData);
      
      expect(chartData.length).toBe(1);
      expect(chartData[0].label).toBe('USD (NGN)');
      expect(chartData[0].data.length).toBe(2);
      expect(chartData[0].data[0]).toEqual({ x: '2023-05-01', y: 0.0022 });
      expect(chartData[0].borderColor).toBeDefined();
      expect(chartData[0].backgroundColor).toBeDefined();
    });
  });

  describe('getTimePeriods', () => {
    it('should return time periods configuration', () => {
      const periods = service.getTimePeriods();
      expect(periods).toEqual(service.TIME_PERIODS);
      expect(periods.length).toBe(4);
    });
  });

  describe('getCurrencyColor', () => {
    it('should return correct colors for known currencies', () => {
      // Access private method through any
      const colorMethod = (service as any).getCurrencyColor;
      
      expect(colorMethod('USD', 1)).toBe('rgba(34, 197, 94, 1)');
      expect(colorMethod('EUR', 0.5)).toBe('rgba(59, 130, 246, 0.5)');
      expect(colorMethod('GBP', 0.8)).toBe('rgba(168, 85, 247, 0.8)');
      expect(colorMethod('BTC', 1)).toBe('rgba(251, 191, 36, 1)');
      expect(colorMethod('CAD', 1)).toBe('rgba(239, 68, 68, 1)');
      expect(colorMethod('GHS', 1)).toBe('rgba(20, 184, 166, 1)');
      expect(colorMethod('NGN', 1)).toBe('rgba(107, 114, 128, 1)');
      expect(colorMethod('JPY', 1)).toBe('rgba(255, 165, 0, 1)');
    });

    it('should return default color for unknown currency', () => {
      const colorMethod = (service as any).getCurrencyColor;
      expect(colorMethod('XYZ', 1)).toBe('rgba(156, 163, 175, 1)');
    });

    it('should handle missing alpha parameter', () => {
      const colorMethod = (service as any).getCurrencyColor;
      expect(colorMethod('USD')).toBe('rgba(34, 197, 94, 1)');
    });
  });

  describe('error handling', () => {
    it('should handle network errors in getLatestRates', () => {
      service.getLatestRates().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      const req = httpMock.expectOne(req => req.url.includes('/latest'));
      req.error(new ErrorEvent('Network error'));
    });

    it('should handle API errors in convertCurrency', () => {
      service.convertCurrency('USD', 'EUR', 100).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      const req = httpMock.expectOne(req => req.url.includes('/convert'));
      req.flush({ success: false, error: 'API error' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('edge cases', () => {
    it('should handle extremely large amounts in conversion', () => {
      const largeAmount = Number.MAX_SAFE_INTEGER;
      service.convertCurrency('USD', 'EUR', largeAmount).subscribe();

      const req = httpMock.expectOne(req => req.url.includes(`amount=${largeAmount}`));
      req.flush({ success: true, result: largeAmount * 0.85 });
    });

    it('should handle special characters in currency codes', () => {
      service.getLatestRates('NG$').subscribe();

      const req = httpMock.expectOne(req => req.url.includes('base=NG$'));
      req.flush(mockExchangeRateResponse);
    });

    it('should handle date format edge cases', () => {
      const invalidDate = '2023-13-32'; // Invalid date
      service.getHistoricalRates(invalidDate).subscribe();

      const req = httpMock.expectOne(req => req.url.includes(invalidDate));
      req.flush(mockExchangeRateResponse);
    });
  });
});