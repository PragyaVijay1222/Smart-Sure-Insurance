import { Component, OnInit, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PolicyService } from '../../../core/services/policy.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PolicyResponse } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LucideDynamicIcon } from '@lucide/angular';
import { UserService } from '../../../core/services/user.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-admin-policies',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    LoadingSpinnerComponent, 
    StatusBadgeComponent,
    LucideDynamicIcon
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 min-h-screen bg-surface-50 dark:bg-surface-950 animate-fade-in text-surface-900 dark:text-surface-50">
      
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold font-display flex items-center gap-3">
            <svg lucideIcon="shield" class="text-primary-500"></svg>
            System Policies
          </h1>
          <p class="text-surface-500 dark:text-surface-400 mt-1">Global overview of all active and issued policies (via PolicyService)</p>
        </div>
      </div>

      <!-- Main Content Table -->
      <div class="glass-card overflow-hidden border-white/5 bg-white/5 shadow-card">
        <div class="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 class="font-bold text-lg text-white tracking-tight">Policy Catalog</h3>
          
          <!-- Quick Search -->
          <div class="relative max-w-sm w-full">
            <svg lucideIcon="search" [size]="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500"></svg>
            <input 
              type="text" 
              placeholder="Search policy number..." 
              class="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-all text-white placeholder:text-surface-600"
            >
          </div>
        </div>

        @if (loading()) {
          <div class="p-20 flex justify-center">
            <app-loading-spinner />
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="bg-white/5 text-surface-400 uppercase tracking-widest text-[10px] font-bold">
                <tr>
                  <th class="px-6 py-4">Policy No</th>
                  <th class="px-6 py-4">Customer ID</th>
                  <th class="px-6 py-4">Type</th>
                  <th class="px-6 py-4">Coverage</th>
                  <th class="px-6 py-4">Status</th>
                  <th class="px-6 py-4">Issued On</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5 text-white">
                @for (policy of policies(); track policy.id) {
                  <tr class="hover:bg-white/5 transition-colors">
                    <td class="px-6 py-4 font-mono font-medium text-primary-400">
                      <button (click)="viewPolicyDetail(policy)" class="hover:underline hover:text-primary-300 transition-all flex items-center gap-2">
                        {{ policy.policyNumber }}
                      </button>
                    </td>
                    <td class="px-6 py-4 text-surface-300">#{{ policy.customerId }}</td>
                    <td class="px-6 py-4 text-surface-200">{{ policy.policyType.name }}</td>
                    <td class="px-6 py-4 font-bold">₹{{ policy.coverageAmount | number }}</td>
                    <td class="px-6 py-4">
                      <app-status-badge [status]="policy.status"></app-status-badge>
                    </td>
                    <td class="px-6 py-4 text-surface-400">{{ policy.createdAt | date:'mediumDate' }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="px-6 py-12 text-center text-surface-500">
                      No policies found in the system.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>

    <!-- Policy Detail Modal Overlay (Guideline 9) -->
    @if (selectedPolicy()) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-surface-950/60 backdrop-blur-md" (click)="closePolicyDetail()"></div>
        
        <!-- Modal Content -->
        <div class="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-card !bg-surface-50/90 dark:!bg-surface-900/90 border-primary-500/20 shadow-2xl shadow-primary-500/10 flex flex-col animate-in zoom-in-95 duration-300">
          
          <!-- Modal Header -->
          <div class="sticky top-0 z-10 p-6 border-b border-surface-200 dark:border-white/10 flex items-center justify-between bg-inherit backdrop-blur-md">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20">
                <svg lucideIcon="file-check" [size]="24"></svg>
              </div>
              <div>
                <h2 class="text-xl font-bold font-display text-surface-900 dark:text-white">Policy #{{ selectedPolicy()?.policyNumber }}</h2>
                <div class="flex items-center gap-2 mt-1">
                  <app-status-badge [status]="selectedPolicy()!.status"></app-status-badge>
                  <span class="text-xs text-surface-500 dark:text-surface-400">• Issued on {{ selectedPolicy()?.createdAt | date:'medium' }}</span>
                </div>
              </div>
            </div>
            <button (click)="closePolicyDetail()" class="p-2 hover:bg-surface-200 dark:hover:bg-white/10 rounded-xl transition-colors">
              <svg lucideIcon="x" [size]="20"></svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <!-- Section: Policy Details -->
            <div class="space-y-6">
              <h3 class="text-xs font-bold uppercase tracking-widest text-primary-500 flex items-center gap-2">
                <svg lucideIcon="briefcase" [size]="14"></svg>
                Policy Configuration
              </h3>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="p-4 rounded-2xl bg-surface-100 dark:bg-white/10 border border-surface-200 dark:border-white/5">
                  <p class="text-[10px] uppercase font-bold text-surface-500 mb-1 tracking-wider">Product</p>
                  <p class="font-bold text-surface-900 dark:text-white">{{ selectedPolicy()?.policyType?.name }}</p>
                </div>
                <div class="p-4 rounded-2xl bg-surface-100 dark:bg-white/10 border border-surface-200 dark:border-white/5">
                  <p class="text-[10px] uppercase font-bold text-surface-500 mb-1 tracking-wider">Category</p>
                  <p class="font-bold text-surface-900 dark:text-white">{{ selectedPolicy()?.policyType?.category }}</p>
                </div>
                <div class="p-4 rounded-2xl bg-surface-100 dark:bg-white/10 border border-surface-200 dark:border-white/5">
                  <p class="text-[10px] uppercase font-bold text-surface-500 mb-1 tracking-wider">Coverage</p>
                  <p class="font-bold text-primary-600 dark:text-primary-400">₹{{ selectedPolicy()?.coverageAmount | number }}</p>
                </div>
                <div class="p-4 rounded-2xl bg-surface-100 dark:bg-white/10 border border-surface-200 dark:border-white/5">
                  <p class="text-[10px] uppercase font-bold text-surface-500 mb-1 tracking-wider">Premium</p>
                  <p class="font-bold text-accent-600 dark:text-accent-400">₹{{ selectedPolicy()?.premiumAmount | number }} / {{ selectedPolicy()?.paymentFrequency }}</p>
                </div>
              </div>

              <div class="p-4 rounded-2xl bg-surface-100 dark:bg-white/10 border border-surface-200 dark:border-white/5 space-y-3">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-surface-500 flex items-center gap-2"><svg lucideIcon="calendar" [size]="14"></svg> Duration</span>
                  <span class="font-medium text-surface-900 dark:text-white">{{ selectedPolicy()?.startDate | date }} — {{ selectedPolicy()?.endDate | date }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-surface-500 flex items-center gap-2"><svg lucideIcon="award" [size]="14"></svg> Nominee</span>
                  <span class="font-medium text-surface-900 dark:text-white">{{ selectedPolicy()?.nomineeName }} ({{ selectedPolicy()?.nomineeRelation }})</span>
                </div>
              </div>
            </div>

            <!-- Section: Customer Details ("Who made this") -->
            <div class="space-y-6">
              <h3 class="text-xs font-bold uppercase tracking-widest text-accent-500 flex items-center gap-2">
                <svg lucideIcon="user" [size]="14"></svg>
                Customer Information
              </h3>

                  @if (loadingCustomer()) {
                    <div class="py-12 flex flex-col items-center justify-center gap-4 bg-surface-100/50 dark:bg-white/5 rounded-3xl border border-dashed border-surface-200 dark:border-white/10">
                      <div class="relative">
                        <div class="w-12 h-12 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin"></div>
                        <div class="absolute inset-0 flex items-center justify-center">
                           <svg lucideIcon="user" [size]="16" class="text-primary-500/50"></svg>
                        </div>
                      </div>
                      <div class="text-center">
                        <p class="text-xs font-bold uppercase tracking-widest text-surface-900 dark:text-white">Fetching Profile</p>
                        <p class="text-[10px] text-surface-500 mt-1">Accessing secure user vault...</p>
                      </div>
                    </div>
                  } @else if (selectedCustomer() && selectedCustomer()?.email) {
                <div class="p-6 rounded-3xl bg-gradient-to-br from-primary-500/5 to-accent-500/5 border border-primary-500/10 space-y-4">
                  <div class="flex items-center gap-4">
                    <div class="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 text-2xl font-bold">
                      {{ selectedCustomer()?.firstName?.charAt(0) }}{{ selectedCustomer()?.lastName?.charAt(0) }}
                    </div>
                    <div>
                      <p class="text-lg font-bold text-surface-900 dark:text-white leading-tight">
                        {{ selectedCustomer()?.firstName }} {{ selectedCustomer()?.lastName }}
                      </p>
                      <p class="text-xs text-surface-500 dark:text-surface-400 uppercase font-bold tracking-widest mt-1">ID: #{{ selectedCustomer()?.userId }}</p>
                    </div>
                  </div>

                  <div class="space-y-3 pt-2">
                    <div class="flex items-center gap-3 text-surface-600 dark:text-surface-300 text-sm">
                      <div class="w-8 h-8 rounded-lg bg-white dark:bg-white/5 flex items-center justify-center shrink-0">
                        <svg lucideIcon="mail" [size]="14" class="text-primary-500"></svg>
                      </div>
                      {{ selectedCustomer()?.email }}
                    </div>
                    <div class="flex items-center gap-3 text-surface-600 dark:text-surface-300 text-sm">
                      <div class="w-8 h-8 rounded-lg bg-white dark:bg-white/5 flex items-center justify-center shrink-0">
                        <svg lucideIcon="phone" [size]="14" class="text-accent-500"></svg>
                      </div>
                      {{ selectedCustomer()?.phone || 'Not provided' }}
                    </div>
                  </div>
                </div>
                  } @else {
                    <div class="py-16 flex flex-col items-center justify-center gap-4 bg-danger-50/50 dark:bg-danger-900/10 rounded-3xl border border-dashed border-danger-500/20">
                      <div class="w-12 h-12 rounded-full bg-danger-500/10 flex items-center justify-center text-danger-500">
                        <svg lucideIcon="shield-alert" [size]="24"></svg>
                      </div>
                      <div class="text-center px-6">
                        <p class="text-xs font-bold uppercase tracking-widest text-danger-600 dark:text-danger-400">Data Unavailable</p>
                        <p class="text-[10px] text-surface-500 dark:text-surface-400 mt-1 leading-relaxed">Could not retrieve customer details for ID #{{ selectedPolicy()?.customerId }}.</p>
                      </div>
                    </div>
                  }
            </div>

          </div>

          <!-- Modal Footer -->
          <div class="p-6 border-t border-surface-200 dark:border-white/10 flex justify-between items-center gap-3 bg-inherit backdrop-blur-md">
             @if (selectedPolicy()?.customerId) {
               <a [routerLink]="['/admin/users', selectedPolicy()!.customerId]"
                 class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-primary-500 hover:bg-primary-600 text-white shadow-md shadow-primary-500/20 transition-all hover:shadow-primary-500/40 hover:scale-[1.02]">
                 <svg lucideIcon="user" [size]="16"></svg>
                 View Full Profile
               </a>
             } @else {
               <div></div>
             }
             <button (click)="closePolicyDetail()" class="px-6 py-2.5 rounded-xl text-sm font-bold border border-surface-200 dark:border-white/10 hover:bg-surface-100 dark:hover:bg-white/5 transition-colors">
                Close
             </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class AdminPoliciesComponent implements OnInit {
  loading = signal(true);
  policies = signal<PolicyResponse[]>([]);

  // Policy Detail State
  selectedPolicy = signal<PolicyResponse | null>(null);
  selectedCustomer = signal<any | null>(null);
  loadingCustomer = signal(false);

  constructor(
    private policyService: PolicyService,
    private notificationService: NotificationService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPolicies();
  }

  loadPolicies(): void {
    this.loading.set(true);
    // Fetch a reasonably large page size for the admin view
    this.policyService.getAllPolicies(0, 50).subscribe({
      next: (res) => {
        this.policies.set(res.content || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.notificationService.error('Fetch Error', 'Failed to load system policies');
        this.loading.set(false);
      }
    });
  }

  // Handle Detail View
  viewPolicyDetail(policy: PolicyResponse): void {
    this.selectedPolicy.set(policy);
    this.selectedCustomer.set(null);

    if (!policy.customerId) {
       console.warn(`[AdminPolicies] Customer ID missing for policy ${policy.policyNumber}`);
       return;
    }

    this.loadingCustomer.set(true);

    this.userService.getInfo(policy.customerId).pipe(
      catchError((err) => {
        console.error(`[AdminPolicies] Failed to fetch customer ${policy.customerId}`, err);
        return of(null);
      }),
      finalize(() => {
        this.loadingCustomer.set(false);
        this.cdr.detectChanges();
      })
    ).subscribe(user => {
      this.selectedCustomer.set(user);
      this.cdr.detectChanges();
    });
  }

  closePolicyDetail(): void {
    this.selectedPolicy.set(null);
    this.selectedCustomer.set(null);
  }
}
