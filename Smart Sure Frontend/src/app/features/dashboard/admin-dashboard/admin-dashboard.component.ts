import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PolicyService } from '../../../core/services/policy.service';
import { AdminService } from '../../../core/services/admin.service';
import { PolicySummaryResponse, AuditLog, AdminClaimDTO } from '../../../core/models';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatCardComponent, StatusBadgeComponent, LoadingSpinnerComponent],
  template: `
    <div class="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16 py-8 animate-fade-in">
      <div class="mb-8">
        <h1 class="text-3xl font-bold font-display text-surface-900 dark:text-white">Admin Dashboard</h1>
        <p class="text-surface-500 dark:text-surface-400 mt-1">System overview and management</p>
      </div>

      @if (loading) {
        <app-loading-spinner />
      } @else {
        <!-- Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <app-stat-card label="Total Policies" [value]="summary?.totalPolicies ?? 0" icon="📋" color="primary" />
          <app-stat-card label="Active Policies" [value]="summary?.activePolicies ?? 0" icon="✅" color="accent" />
          <app-stat-card label="Claims Under Review" [value]="underReviewClaims.length" icon="🔍" color="warning" />
          <app-stat-card label="Premium Collected" [value]="summary?.totalPremiumCollected ?? 0" icon="💰" color="accent" prefix="₹" />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Claims Under Review -->
          <div class="rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800">
            <div class="px-6 py-4 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
              <h2 class="font-semibold text-surface-800 dark:text-white">Claims Awaiting Review</h2>
              <a routerLink="/admin/claims" class="text-sm text-primary-500 hover:text-primary-600 font-medium">View All →</a>
            </div>
            @if (underReviewClaims.length === 0) {
              <div class="p-6 text-center text-surface-500">No claims pending review</div>
            } @else {
              <div class="divide-y divide-surface-100 dark:divide-surface-700">
                @for (claim of underReviewClaims.slice(0, 5); track claim.id) {
                  <a [routerLink]="['/admin/claims', claim.id]" class="flex items-center justify-between px-6 py-4 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
                    <div>
                      <span class="font-medium text-surface-800 dark:text-surface-200">Claim #{{ claim.id }}</span>
                      <span class="text-sm text-surface-500 ml-3">Policy #{{ claim.policyId }}</span>
                    </div>
                    <app-status-badge [status]="claim.status" />
                  </a>
                }
              </div>
            }
          </div>

          <!-- Recent Activity -->
          <div class="rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800">
            <div class="px-6 py-4 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
              <h2 class="font-semibold text-surface-800 dark:text-white">Recent Activity</h2>
              <a routerLink="/admin/audit-logs" class="text-sm text-primary-500 hover:text-primary-600 font-medium">View All →</a>
            </div>
            @if (recentLogs.length === 0) {
              <div class="p-6 text-center text-surface-500">No recent activity</div>
            } @else {
              <div class="divide-y divide-surface-100 dark:divide-surface-700">
                @for (log of recentLogs; track log.id) {
                  <div class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-sm">📝</div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-surface-800 dark:text-surface-200">{{ log.action }}</p>
                        <p class="text-xs text-surface-500">{{ log.targetEntity }} #{{ log.targetId }}</p>
                      </div>
                      <span class="text-xs text-surface-400">{{ log.performedAt | date:'short' }}</span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  summary: PolicySummaryResponse | null = null;
  underReviewClaims: AdminClaimDTO[] = [];
  recentLogs: AuditLog[] = [];
  loading = true;

  constructor(
    private policyService: PolicyService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.policyService.getPolicySummary().subscribe({
      next: (res) => {
        this.summary = res;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });

    this.adminService.getUnderReviewClaims().subscribe({
      next: (res) => (this.underReviewClaims = res),
    });

    this.adminService.getRecentActivity(5).subscribe({
      next: (res) => (this.recentLogs = res),
    });
  }
}
