import { Routes } from '@angular/router';

export const CLAIM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./claim-list/claim-list.component').then(m => m.ClaimListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./claim-create/claim-create.component').then(m => m.ClaimCreateComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./claim-detail/claim-detail.component').then(m => m.ClaimDetailComponent)
  }
];
