import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import player from 'lottie-web';

import { routes } from './app.routes';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { appState } from './store/app.state';
import { MockBackendService } from './core/services/mock-backend.service';
import { WalletEffects } from './store/wallet/wallet.effects';
import { TransactionEffects } from './store/transaction/transaction.effects';
import { ExchangeRateEffects } from './store/exchange-rate/exchange-rate.effects';
import { metaReducers } from './store/meta-reducers/local-storage.meta-reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStore(appState, { metaReducers }),
    provideEffects([WalletEffects, TransactionEffects, ExchangeRateEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: 'LOTTIE_OPTIONS',
      useValue: {
        player: () => player,
      },
    },
    HttpClientInMemoryWebApiModule.forRoot(MockBackendService, {
      delay: 500,
      passThruUnknownUrl: true,
      apiBase: 'api/'
    }).providers!
]
};
