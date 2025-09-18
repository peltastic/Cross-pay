import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  private readonly env = environment;

  constructor() {}

  get isProduction(): boolean {
    return this.env.production;
  }

  get isDevelopment(): boolean {
    return !this.env.production;
  }

  get exchangeRateApiUrl(): string {
    return this.env.exchangeRateApiUrl;
  }

  get exchangeRateApiKey(): string {
    return this.env.exchangerateApiKey;
  }

  getExchangeRateEndpoint(baseCurrency: string = 'USD'): string {
    return `${this.exchangeRateApiUrl}/${baseCurrency}?access_key=${this.exchangeRateApiKey}`;
  }

  logEnvironmentInfo(): void {
    if (this.isDevelopment) {
      console.log('Environment Info:', {
        production: this.isProduction,
        exchangeRateApiUrl: this.exchangeRateApiUrl,
        hasApiKey: !!this.exchangeRateApiKey,
      });
    }
  }
}
