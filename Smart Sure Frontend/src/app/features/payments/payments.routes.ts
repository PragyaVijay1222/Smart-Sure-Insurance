import { Routes } from '@angular/router';

export const PAYMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./payment-history/payment-history.component').then(m => m.PaymentHistoryComponent)
  }
];
