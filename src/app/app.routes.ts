import { Routes } from '@angular/router';
import { authGuard } from './core/guards';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/get-started',
    pathMatch: 'full',
  },
  {
    path: 'get-started',
    loadComponent: () => import('./pages/onboarding/onboarding.component').then(m => m.Onboarding),
    data: { preload: true }
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard],
    data: { preload: true }
  },
  {
    path: 'dashboard/transactions',
    loadComponent: () => import('./pages/transactions/transactions').then(m => m.Transactions),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard/fx-analytics',
    loadComponent: () => import('./pages/fx-analytics/fx-analytics').then(m => m.FxAnalytics),
    canActivate: [authGuard]
  },
];
