import { Routes } from '@angular/router';

export const POLICY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./policy-list/policy-list.component').then(m => m.PolicyListComponent)
  },
  {
    path: 'purchase',
    loadComponent: () => import('./policy-purchase/policy-purchase.component').then(m => m.PolicyPurchaseComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./policy-detail/policy-detail.component').then(m => m.PolicyDetailComponent)
  }
];
