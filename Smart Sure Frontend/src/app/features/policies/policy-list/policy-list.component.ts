import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PolicyService } from '../../../core/services/policy.service';
import { PolicyResponse } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LucideDynamicIcon, LucideShield, LucideChevronRight, LucideCircleAlert } from '@lucide/angular';

@Component({
  selector: 'app-policy-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, StatusBadgeComponent, LucideDynamicIcon],
  template: `
    <div class="px-4 sm:px-8 lg:px-16 py-8 max-w-[1600px] mx-auto animate-fade-in">
      
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold font-display text-surface-900 dark:text-white mb-2">My Policies</h1>
          <p class="text-surface-500 dark:text-surface-400">Manage all your active and past insurance policies.</p>
        </div>
        <a routerLink="/policy-types" class="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/20 transition-all flex items-center gap-2">
          Buy New Policy
        </a>
      </div>

      @if (loading) {
        <app-loading-spinner />
      } @else if (policies.length > 0) {
        <div class="bg-white dark:bg-surface-800 rounded-2xl shadow-card border border-surface-200 dark:border-surface-700 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="bg-surface-50 dark:bg-surface-900/50 text-surface-500 border-b border-surface-200 dark:border-surface-700">
                <tr>
                  <th class="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Policy Info</th>
                  <th class="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Type</th>
                  <th class="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Coverage</th>
                  <th class="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Premium</th>
                  <th class="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Status</th>
                  <th class="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-surface-100 dark:divide-surface-700/50">
                @for (policy of policies; track policy.id) {
                  <tr class="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors group">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center text-primary-500">
                           <svg lucideIcon="shield" [size]="20"></svg>
                        </div>
                        <div>
                          <p class="font-bold text-surface-900 dark:text-white">{{ policy.policyNumber }}</p>
                          <p class="text-[10px] text-surface-500 font-mono tracking-wider mt-0.5">{{ policy.startDate | date:'mediumDate' }} - {{ policy.endDate | date:'mediumDate' }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 font-medium text-surface-700 dark:text-surface-300">{{ policy.policyType.name }}</td>
                    <td class="px-6 py-4 font-semibold text-surface-900 dark:text-white">₹{{ policy.coverageAmount | number }}</td>
                    <td class="px-6 py-4 font-medium text-surface-700 dark:text-surface-300">₹{{ policy.premiumAmount | number }}/mo</td>
                    <td class="px-6 py-4">
                      <app-status-badge [status]="policy.status"></app-status-badge>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <a [routerLink]="['/policies', policy.id]" class="inline-flex items-center justify-center p-2 rounded-lg text-surface-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all">
                        <svg lucideIcon="chevron-right" [size]="20"></svg>
                      </a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      } @else {
        <div class="bg-surface-50 dark:bg-surface-800/50 border border-dashed border-surface-300 dark:border-surface-700 rounded-3xl p-12 text-center flex flex-col items-center max-w-2xl mx-auto mt-12">
          <div class="w-16 h-16 bg-surface-200 dark:bg-surface-700 rounded-full flex items-center justify-center mb-4 text-surface-400">
            <svg lucideIcon="circle-alert" [size]="32"></svg>
          </div>
          <h2 class="text-xl font-bold text-surface-900 dark:text-white mb-2">No policies found</h2>
          <p class="text-surface-500 dark:text-surface-400 mb-6 max-w-md">You don't have any active or past policies with us yet. Secure your future right now.</p>
          <a routerLink="/policy-types" class="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/20 transition-all">
            Explore Plans
          </a>
        </div>
      }
    </div>
  `
})
export class PolicyListComponent implements OnInit {
  policies: PolicyResponse[] = [];
  loading = true;

  readonly Shield = LucideShield;
  readonly ChevronRight = LucideChevronRight;
  readonly CircleAlert = LucideCircleAlert;

  constructor(private policyService: PolicyService) {}

  ngOnInit(): void {
    this.policyService.getMyPolicies(0, 100).subscribe({
      next: (res) => {
        this.policies = res.content || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
