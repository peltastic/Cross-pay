import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/get-started',
    pathMatch: 'full',
  },
  {
    path: 'get-started',
    loadComponent: () => import('./pages/onboarding/onboarding.component').then(m => m.Onboarding),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),
  },
  {
    path: 'dashboard/transactions',
    loadComponent: () => import('./pages/transactions/transactions').then(m => m.Transactions),
  },
  {
    path: 'dashboard/fx-analytics',
    loadComponent: () => import('./pages/fx-analytics/fx-analytics').then(m => m.FxAnalytics),
  },
];
