import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { PolicyTypeCatalogComponent } from './features/policy-types/policy-type-catalog/policy-type-catalog.component';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: PolicyTypeCatalogComponent, // Public homepage
        pathMatch: 'full'
      },
      {
        path: 'policy-types',
        component: PolicyTypeCatalogComponent // Explicit path
      },
      // Protected customer routes
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard]
      },
      {
        path: 'policies',
        loadChildren: () => import('./features/policies/policies.routes').then(m => m.POLICY_ROUTES),
        canActivate: [authGuard]
      },
      {
        path: 'claims',
        loadChildren: () => import('./features/claims/claims.routes').then(m => m.CLAIM_ROUTES),
        canActivate: [authGuard]
      },
      {
        path: 'payments',
        loadChildren: () => import('./features/payments/payments.routes').then(m => m.PAYMENT_ROUTES),
        canActivate: [authGuard]
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard]
      }
    ]
  },
  {
    path: 'admin',
    component: MainLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'claims',
        loadComponent: () => import('./features/admin/admin-claims/admin-claims.component').then(m => m.AdminClaimsComponent)
      },
      {
        path: 'claims/:id',
        loadComponent: () => import('./features/admin/admin-claims/admin-claims.component').then(m => m.AdminClaimsComponent)
      },
      {
        path: 'policy-types',
        loadComponent: () => import('./features/admin/admin-policy-types/admin-policy-types.component').then(m => m.AdminPolicyTypesComponent)
      },
      {
        path: 'policies',
        loadComponent: () => import('./features/admin/admin-policies/admin-policies.component').then(m => m.AdminPoliciesComponent)
      },
      {
        path: 'audit-logs',
        loadComponent: () => import('./features/admin/admin-audit-logs/admin-audit-logs.component').then(m => m.AdminAuditLogsComponent)
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./features/admin/admin-user-detail/admin-user-detail.component').then(m => m.AdminUserDetailComponent)
      }
      // Add other admin children routes here
    ]
  },
  { path: '**', redirectTo: '' }
];
