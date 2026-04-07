import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PolicyService } from '../../../core/services/policy.service';
import { ClaimService } from '../../../core/services/claim.service';
import { PolicyResponse, ClaimResponse } from '../../../core/models';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatCardComponent, StatusBadgeComponent, LoadingSpinnerComponent],
  template: `
    <div class="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16 py-8 animate-fade-in">
      <div class="mb-8">
        <h1 class="text-3xl font-bold font-display text-surface-900 dark:text-white">Dashboard</h1>
        <p class="text-surface-500 dark:text-surface-400 mt-1">Welcome back! Here's your insurance overview.</p>
      </div>

      @if (loading) {
        <app-loading-spinner />
      } @else {
        <!-- Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <app-stat-card label="Total Policies" [value]="policies.length" icon="📋" color="primary" />
          <app-stat-card label="Active Policies" [value]="activePolicies" icon="✅" color="accent" />
          <app-stat-card label="Pending Claims" [value]="pendingClaims" icon="📝" color="warning" />
          <app-stat-card label="Total Coverage" [value]="totalCoverage" icon="🛡️" color="primary" prefix="₹" />
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <a routerLink="/policy-types" class="group block p-6 rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 hover:shadow-card-hover hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300">
            <div class="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span class="text-2xl">🏥</span>
            </div>
            <h3 class="font-semibold text-surface-800 dark:text-white">Browse Plans</h3>
            <p class="text-sm text-surface-500 dark:text-surface-400 mt-1">Explore insurance plans and get coverage</p>
          </a>
          <a routerLink="/claims/new" class="group block p-6 rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 hover:shadow-card-hover hover:border-accent-300 dark:hover:border-accent-600 transition-all duration-300">
            <div class="w-12 h-12 rounded-xl bg-accent-100 dark:bg-accent-900/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span class="text-2xl">📄</span>
            </div>
            <h3 class="font-semibold text-surface-800 dark:text-white">File a Claim</h3>
            <p class="text-sm text-surface-500 dark:text-surface-400 mt-1">Submit a new insurance claim</p>
          </a>
          <a routerLink="/payments" class="group block p-6 rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 hover:shadow-card-hover hover:border-warning-400 dark:hover:border-warning-500 transition-all duration-300">
            <div class="w-12 h-12 rounded-xl bg-warning-100 dark:bg-warning-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span class="text-2xl">💳</span>
            </div>
            <h3 class="font-semibold text-surface-800 dark:text-white">Payment History</h3>
            <p class="text-sm text-surface-500 dark:text-surface-400 mt-1">View and manage your payments</p>
          </a>
        </div>

        <!-- Recent Policies -->
        <div class="rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 overflow-hidden">
          <div class="px-6 py-4 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <h2 class="font-semibold text-surface-800 dark:text-white">Recent Policies</h2>
            <a routerLink="/policies" class="text-sm text-primary-500 hover:text-primary-600 font-medium">View All →</a>
          </div>
          @if (policies.length === 0) {
            <div class="p-8 text-center text-surface-500 dark:text-surface-400">
              <p>No policies yet. <a routerLink="/policy-types" class="text-primary-500 font-medium">Browse plans</a> to get started.</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-surface-50 dark:bg-surface-900/50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Policy</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Type</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Premium</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-surface-100 dark:divide-surface-700">
                  @for (policy of policies.slice(0, 5); track policy.id) {
                    <tr class="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                      <td class="px-6 py-4">
                        <span class="font-medium text-surface-800 dark:text-surface-200">{{ policy.policyNumber }}</span>
                      </td>
                      <td class="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{{ policy.policyType.name }}</td>
                      <td class="px-6 py-4 text-sm font-medium text-surface-800 dark:text-surface-200">₹{{ policy.premiumAmount | number }}</td>
                      <td class="px-6 py-4"><app-status-badge [status]="policy.status" /></td>
                      <td class="px-6 py-4">
                        <a [routerLink]="['/policies', policy.id]" class="text-primary-500 hover:text-primary-600 text-sm font-medium">Details</a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class CustomerDashboardComponent implements OnInit {
  policies: PolicyResponse[] = [];
  claims: ClaimResponse[] = [];
  loading = true;

  constructor(
    private policyService: PolicyService,
    private claimService: ClaimService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  get activePolicies(): number {
    return this.policies.filter((p) => p.status === 'ACTIVE').length;
  }

  get pendingClaims(): number {
    return this.claims.filter((c) => c.status !== 'CLOSED' && c.status !== 'APPROVED' && c.status !== 'REJECTED').length;
  }

  get totalCoverage(): number {
    return this.policies
      .filter((p) => p.status === 'ACTIVE')
      .reduce((sum, p) => sum + (p.coverageAmount || 0), 0);
  }

  private loadData(): void {
    this.policyService.getMyPolicies(0, 100).subscribe({
      next: (res) => {
        this.policies = res.content;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });

    this.claimService.getMyClaims().subscribe({
      next: (res) => (this.claims = res),
      error: () => {},
    });
  }
}
