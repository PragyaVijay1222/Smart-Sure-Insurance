import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PolicyService } from '../../core/services/policy.service';
import { ClaimService } from '../../core/services/claim.service';
import { PaymentService } from '../../core/services/payment.service';
import { AuthService } from '../../core/services/auth.service';
import { PolicyResponse, ClaimResponse, PaymentResponse } from '../../core/models';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { LucideDynamicIcon, LucideShield, LucideFileText, LucideCreditCard, LucideChevronRight, LucideTriangleAlert } from '@lucide/angular';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, StatusBadgeComponent, LucideDynamicIcon],
  template: `
    <div class="px-4 sm:px-8 lg:px-16 py-8 max-w-[1600px] mx-auto animate-fade-in">
      <div class="mb-8">
        <h1 class="text-3xl font-bold font-display text-surface-900 dark:text-white mb-2">Welcome back{{ userName ? ', ' + userName : '' }}!</h1>
        <p class="text-surface-500 dark:text-surface-400">Here's what's happening with your insurance today.</p>
      </div>

      @if (loading) {
        <app-loading-spinner />
      } @else {
        <!-- Metrics -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <div class="bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-card border border-surface-200 dark:border-surface-700">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center text-primary-500">
                <svg lucideIcon="shield" [size]="24"></svg>
              </div>
              <span class="text-3xl font-bold text-surface-900 dark:text-white">{{ activePoliciesCount }}</span>
            </div>
            <h3 class="font-semibold text-surface-800 dark:text-surface-200">Active Policies</h3>
            <p class="text-sm text-surface-500 dark:text-surface-400 mt-1">Total coverage: ₹{{ totalCoverage | number }}</p>
          </div>
          
          <div class="bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-card border border-surface-200 dark:border-surface-700">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-full bg-warning-50 dark:bg-warning-900/40 flex items-center justify-center text-warning-500">
                <svg lucideIcon="file-text" [size]="24"></svg>
              </div>
              <span class="text-3xl font-bold text-surface-900 dark:text-white">{{ openClaimsCount }}</span>
            </div>
            <h3 class="font-semibold text-surface-800 dark:text-surface-200">Open Claims</h3>
            <p class="text-sm text-surface-500 dark:text-surface-400 mt-1">Currently under review</p>
          </div>
          
          <div class="bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-card border border-surface-200 dark:border-surface-700">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-full bg-danger-50 dark:bg-danger-900/40 flex items-center justify-center text-danger-500">
                <svg lucideIcon="credit-card" [size]="24"></svg>
              </div>
              <span class="text-3xl font-bold text-surface-900 dark:text-white">{{ pendingPaymentsCount }}</span>
            </div>
            <h3 class="font-semibold text-surface-800 dark:text-surface-200">Pending Payments</h3>
            <p class="text-sm text-surface-500 dark:text-surface-400 mt-1">Premiums due soon</p>
          </div>
          
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <!-- Recent Policies -->
          <div class="bg-white dark:bg-surface-800 rounded-2xl shadow-card border border-surface-200 dark:border-surface-700 overflow-hidden flex flex-col">
            <div class="p-6 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
              <h3 class="font-bold text-lg text-surface-900 dark:text-white">Recent Policies</h3>
              <a routerLink="/policies" class="text-sm font-semibold text-primary-500 hover:text-primary-600 flex items-center gap-1">
                View all <svg lucideIcon="chevron-right" [size]="16"></svg>
              </a>
            </div>
            <div class="p-0 flex-1">
              @if (policies.length === 0) {
                <div class="p-8 text-center text-surface-500">
                  You don't have any policies yet.
                  <a routerLink="/policy-types" class="text-primary-500 block mt-2 hover:underline">Explore Insurance Plans</a>
                </div>
              } @else {
                <div class="divide-y divide-surface-100 dark:divide-surface-700/50">
                  @for (policy of policies.slice(0, 3); track policy.id) {
                    <a [routerLink]="['/policies', policy.id]" class="block p-4 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
                      <div class="flex items-start justify-between mb-2">
                        <span class="font-semibold text-surface-800 dark:text-surface-200">{{ policy.policyType.name }}</span>
                        <app-status-badge [status]="policy.status"></app-status-badge>
                      </div>
                      <div class="flex justify-between text-sm text-surface-500">
                        <span>Cover: ₹{{ policy.coverageAmount | number }}</span>
                        <span>Premium: ₹{{ policy.premiumAmount | number }}/mo</span>
                      </div>
                    </a>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Pending Premium Actions -->
          <div class="bg-white dark:bg-surface-800 rounded-2xl shadow-card border border-surface-200 dark:border-surface-700 overflow-hidden flex flex-col">
            <div class="p-6 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
              <h3 class="font-bold text-lg text-surface-900 dark:text-white flex items-center gap-2">
                Action Required <svg *ngIf="pendingPaymentsCount > 0" lucideIcon="triangle-alert" [size]="18" class="text-warning-500"></svg>
              </h3>
            </div>
            <div class="p-0 flex-1">
              @if (pendingPaymentsCount === 0) {
                <div class="p-8 text-center text-surface-500">
                  You're all caught up! No pending payments.
                </div>
              } @else {
                 <div class="p-6 space-y-4">
                  <div class="p-4 rounded-xl bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 flex items-center justify-between">
                    <div>
                      <p class="font-bold text-danger-800 dark:text-danger-300">You have {{ pendingPaymentsCount }} unpaid premium(s)</p>
                      <p class="text-sm text-danger-600 dark:text-danger-400 mt-1">Please pay to keep your policies active.</p>
                    </div>
                    <a routerLink="/payments" class="px-4 py-2 bg-danger-600 hover:bg-danger-700 text-white rounded-lg text-sm font-semibold transition-colors">
                      Pay Now
                    </a>
                  </div>
                </div>
              }
            </div>
          </div>

        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  userName = '';
  loading = true;

  policies: PolicyResponse[] = [];
  claims: ClaimResponse[] = [];
  payments: PaymentResponse[] = [];

  activePoliciesCount = 0;
  totalCoverage = 0;
  openClaimsCount = 0;
  pendingPaymentsCount = 0;

  readonly Shield = LucideShield;
  readonly FileText = LucideFileText;
  readonly CreditCard = LucideCreditCard;
  readonly ChevronRight = LucideChevronRight;
  readonly TriangleAlert = LucideTriangleAlert;

  constructor(
    private policyService: PolicyService,
    private claimService: ClaimService,
    private paymentService: PaymentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: any) => {
      if (user?.email) {
        this.userName = user.email.split('@')[0];
      }
    });

    forkJoin({
      policiesRes: this.policyService.getMyPolicies(0, 10).pipe(catchError(() => of({ content: [], totalElements: 0, totalPages: 0, size: 10, number: 0 }))),
      claimsRes: this.claimService.getMyClaims().pipe(catchError(() => of([]))),
      paymentsRes: this.paymentService.getMyPayments().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ policiesRes, claimsRes, paymentsRes }) => {
        this.policies = policiesRes.content;
        this.claims = claimsRes;
        this.payments = paymentsRes;

        // Calculate metrics
        this.activePoliciesCount = this.policies.filter(p => p.status === 'ACTIVE').length;
        this.totalCoverage = this.policies.filter(p => p.status === 'ACTIVE').reduce((sum, p) => sum + p.coverageAmount, 0);
        
        this.openClaimsCount = this.claims.filter(c => ['SUBMITTED', 'UNDER_REVIEW'].includes(c.status)).length;
        
        // This relies on payments. Alternatively we check policies for PENDING premiums
        this.pendingPaymentsCount = this.payments.filter(p => ['PENDING', 'PAYMENT_IN_PROGRESS', 'OVERDUE'].includes(p.status)).length;
        
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
