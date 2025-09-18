import { TestBed } from '@angular/core/testing';
import { EnvironmentService } from './environment.service';
import { environment } from '../../../environments/environment';

describe('EnvironmentService', () => {
  let service: EnvironmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnvironmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return correct production status', () => {
    expect(service.isProduction).toBe(environment.production);
  });

  it('should return correct development status', () => {
    expect(service.isDevelopment).toBe(!environment.production);
  });

  it('should return exchange rate API URL', () => {
    expect(service.exchangeRateApiUrl).toBe(environment.exchangeRateApiUrl);
  });

  it('should return exchange rate API key', () => {
    expect(service.exchangeRateApiKey).toBe(environment.exchangerateApiKey);
  });

  it('should construct exchange rate endpoint with default USD base currency', () => {
    const expectedUrl = `${environment.exchangeRateApiUrl}/USD?access_key=${environment.exchangerateApiKey}`;
    
    expect(service.getExchangeRateEndpoint()).toBe(expectedUrl);
  });

  it('should construct exchange rate endpoint with custom base currency', () => {
    const baseCurrency = 'EUR';
    const expectedUrl = `${environment.exchangeRateApiUrl}/${baseCurrency}?access_key=${environment.exchangerateApiKey}`;
    
    expect(service.getExchangeRateEndpoint(baseCurrency)).toBe(expectedUrl);
  });

  it('should log environment info in development mode', () => {
    spyOn(console, 'log');
    
    spyOnProperty(service, 'isDevelopment', 'get').and.returnValue(true);
    
    service.logEnvironmentInfo();
    
    expect(console.log).toHaveBeenCalledWith('Environment Info:', {
      production: service.isProduction,
      exchangeRateApiUrl: service.exchangeRateApiUrl,
      hasApiKey: !!service.exchangeRateApiKey,
    });
  });

  it('should not log environment info in production mode', () => {
    spyOn(console, 'log');
    
    spyOnProperty(service, 'isDevelopment', 'get').and.returnValue(false);
    
    service.logEnvironmentInfo();
    
    expect(console.log).not.toHaveBeenCalled();
  });

  it('should handle empty or undefined API key', () => {
    spyOnProperty(service, 'exchangeRateApiKey', 'get').and.returnValue('');
    spyOnProperty(service, 'isDevelopment', 'get').and.returnValue(true);
    spyOn(console, 'log');
    
    service.logEnvironmentInfo();
    
    expect(console.log).toHaveBeenCalledWith('Environment Info:', {
      production: service.isProduction,
      exchangeRateApiUrl: service.exchangeRateApiUrl,
      hasApiKey: false,
    });
  });

  it('should handle various base currencies in endpoint construction', () => {
    const testCurrencies = ['EUR', 'GBP', 'JPY', 'CAD'];
    
    testCurrencies.forEach(currency => {
      const endpoint = service.getExchangeRateEndpoint(currency);
      expect(endpoint).toContain(`/${currency}?`);
      expect(endpoint).toContain(service.exchangeRateApiUrl);
      expect(endpoint).toContain(service.exchangeRateApiKey);
    });
  });
});