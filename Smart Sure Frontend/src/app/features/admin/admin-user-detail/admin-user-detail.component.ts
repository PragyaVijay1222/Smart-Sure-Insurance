import {
  Component, OnInit, signal, computed,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PolicyService } from '../../../core/services/policy.service';
import { ClaimService } from '../../../core/services/claim.service';
import { UserService } from '../../../core/services/user.service';
import { PolicyResponse, ClaimResponse, UserResponse } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LucideDynamicIcon } from '@lucide/angular';

@Component({
  selector: 'app-admin-user-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, StatusBadgeComponent, LucideDynamicIcon],
  template: `
    <div class="min-h-screen p-6 sm:px-8 lg:px-16 max-w-[1600px] mx-auto animate-fade-in text-surface-950 dark:text-surface-50">

      <!-- Back Navigation -->
      <button (click)="goBack()"
        class="mb-6 flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors font-medium group">
        <svg lucideIcon="arrow-left" [size]="18" class="transition-transform group-hover:-translate-x-1"></svg>
        Back to System Policies
      </button>

      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-40 gap-6">
          <app-loading-spinner />
          <p class="text-sm text-surface-500 dark:text-surface-400 animate-pulse tracking-widest uppercase font-bold">Loading Customer Profile...</p>
        </div>
      } @else if (error()) {
        <div class="glass-card p-12 flex flex-col items-center justify-center gap-4 text-center">
          <div class="w-16 h-16 rounded-2xl bg-danger-500/10 flex items-center justify-center text-danger-500">
            <svg lucideIcon="shield-alert" [size]="32"></svg>
          </div>
          <p class="text-danger-500 font-bold">{{ error() }}</p>
          <button (click)="loadData()" class="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-bold transition-colors">
            Retry
          </button>
        </div>
      } @else {

        <!-- Hero: Customer Profile Card -->
        <div class="glass-card p-8 mb-8 bg-gradient-to-br from-primary-500/5 via-transparent to-accent-500/5 border-primary-500/10">
          <div class="flex flex-col md:flex-row md:items-center gap-6">

            <!-- Avatar -->
            <div class="relative shrink-0">
              <div class="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-primary-500/30">
                {{ getInitials() }}
              </div>
              <div class="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 border-2 border-surface-50 dark:border-surface-900 flex items-center justify-center">
                <svg lucideIcon="shield-check" [size]="14" class="text-white"></svg>
              </div>
            </div>

            <!-- Info -->
            <div class="flex-1">
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 class="text-3xl font-black font-display text-surface-900 dark:text-white leading-tight">
                    {{ customer()?.firstName }} {{ customer()?.lastName }}
                  </h1>
                  <p class="text-xs text-primary-500 dark:text-primary-400 font-bold uppercase tracking-widest mt-1">
                    Customer ID #{{ customer()?.userId }}
                  </p>
                </div>
                <div class="flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full">
                  <svg lucideIcon="shield" [size]="14" class="text-primary-500"></svg>
                  <span class="text-xs font-bold text-primary-600 dark:text-primary-400">{{ customer()?.role }}</span>
                </div>
              </div>

              <div class="flex flex-wrap gap-6 mt-4">
                <div class="flex items-center gap-2 text-surface-600 dark:text-surface-300 text-sm">
                  <div class="w-8 h-8 rounded-lg bg-surface-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                    <svg lucideIcon="mail" [size]="14" class="text-primary-500"></svg>
                  </div>
                  {{ customer()?.email }}
                </div>
                <div class="flex items-center gap-2 text-surface-600 dark:text-surface-300 text-sm">
                  <div class="w-8 h-8 rounded-lg bg-surface-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                    <svg lucideIcon="phone" [size]="14" class="text-accent-500"></svg>
                  </div>
                  {{ customer()?.phone || 'Not provided' }}
                </div>
              </div>
            </div>

            <!-- Quick Stats -->
            <div class="flex gap-4 md:flex-col md:items-end shrink-0">
              <div class="p-4 rounded-2xl bg-surface-100 dark:bg-white/5 border border-surface-200 dark:border-white/5 text-center min-w-[80px]">
                <p class="text-2xl font-black text-surface-900 dark:text-white">{{ policies().length }}</p>
                <p class="text-[10px] uppercase font-bold text-surface-500 tracking-widest mt-1">Policies</p>
              </div>
              <div class="p-4 rounded-2xl bg-surface-100 dark:bg-white/5 border border-surface-200 dark:border-white/5 text-center min-w-[80px]">
                <p class="text-2xl font-black text-surface-900 dark:text-white">{{ claims().length }}</p>
                <p class="text-[10px] uppercase font-bold text-surface-500 tracking-widest mt-1">Claims</p>
              </div>
              <div class="p-4 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-center min-w-[80px]">
                <p class="text-xl font-black text-primary-600 dark:text-primary-400">₹{{ formatAmount(totalPremiumPaid()) }}</p>
                <p class="text-[10px] uppercase font-bold text-primary-500 tracking-widest mt-1">Paid</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 xl:grid-cols-5 gap-8">

          <!-- Policies Portfolio (wider column) -->
          <div class="xl:col-span-3 glass-card overflow-hidden">
            <div class="p-6 border-b border-surface-200 dark:border-white/5 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20">
                  <svg lucideIcon="shield" [size]="18"></svg>
                </div>
                <div>
                  <h2 class="font-bold text-surface-900 dark:text-white">Policies Portfolio</h2>
                  <p class="text-[10px] text-surface-500 uppercase font-bold tracking-widest">{{ policies().length }} total</p>
                </div>
              </div>
            </div>

            @if (policies().length === 0) {
              <div class="p-16 text-center text-surface-500 text-sm">No policies found for this customer.</div>
            } @else {
              <div class="divide-y divide-surface-100 dark:divide-white/5">
                @for (policy of policies(); track policy.id) {
                  <div class="p-5 hover:bg-surface-50 dark:hover:bg-white/3 transition-colors">
                    <!-- Policy Header -->
                    <div class="flex items-start justify-between gap-4 mb-4">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
                          [class]="getCategoryIcon(policy.policyType?.category || '').bg">
                          <svg [lucideIcon]="getCategoryIcon(policy.policyType?.category || '').icon" [size]="18"></svg>
                        </div>
                        <div>
                          <p class="font-bold text-surface-900 dark:text-white text-sm">{{ policy.policyType?.name }}</p>
                          <p class="font-mono text-[11px] text-primary-500 dark:text-primary-400 font-bold">{{ policy.policyNumber }}</p>
                        </div>
                      </div>
                      <app-status-badge [status]="policy.status"></app-status-badge>
                    </div>

                    <!-- Policy Stats Row -->
                    <div class="grid grid-cols-3 gap-3 mb-4">
                      <div class="p-3 rounded-xl bg-surface-100 dark:bg-white/5">
                        <p class="text-[9px] uppercase font-bold text-surface-400 tracking-widest mb-1">Coverage</p>
                        <p class="text-sm font-bold text-surface-900 dark:text-white">₹{{ policy.coverageAmount | number }}</p>
                      </div>
                      <div class="p-3 rounded-xl bg-surface-100 dark:bg-white/5">
                        <p class="text-[9px] uppercase font-bold text-surface-400 tracking-widest mb-1">Premium</p>
                        <p class="text-sm font-bold text-primary-600 dark:text-primary-400">₹{{ policy.premiumAmount | number }}</p>
                        <p class="text-[9px] text-surface-500">{{ policy.paymentFrequency }}</p>
                      </div>
                      <div class="p-3 rounded-xl bg-surface-100 dark:bg-white/5">
                        <p class="text-[9px] uppercase font-bold text-surface-400 tracking-widest mb-1">Paid Total</p>
                        <p class="text-sm font-bold text-emerald-600 dark:text-emerald-400">₹{{ getPaidPremiumsForPolicy(policy) | number }}</p>
                        <p class="text-[9px] text-surface-500">{{ getPaidCountForPolicy(policy) }} payment(s)</p>
                      </div>
                    </div>

                    <!-- Dates -->
                    <div class="flex items-center justify-between text-[11px] text-surface-500 dark:text-surface-400 px-1">
                      <span class="flex items-center gap-1">
                        <svg lucideIcon="activity" [size]="11"></svg>
                        Started: {{ policy.startDate | date:'mediumDate' }}
                      </span>
                      <span class="flex items-center gap-1">
                        <svg lucideIcon="clock" [size]="11"></svg>
                        Ends: {{ policy.endDate | date:'mediumDate' }}
                      </span>
                    </div>

                    <!-- Premium Ledger (collapsible inline) -->
                    @if (policy.premiums && policy.premiums.length > 0) {
                      <div class="mt-4 rounded-xl border border-surface-200 dark:border-white/5 overflow-hidden">
                        <div class="px-4 py-2 bg-surface-50 dark:bg-white/3 text-[9px] uppercase font-bold tracking-widest text-surface-500 grid grid-cols-4 gap-2">
                          <span>Amount</span><span>Due Date</span><span>Paid On</span><span>Status</span>
                        </div>
                        @for (premium of policy.premiums; track premium.id) {
                          <div class="px-4 py-2.5 grid grid-cols-4 gap-2 text-xs border-t border-surface-100 dark:border-white/5 items-center"
                            [ngClass]="{'bg-emerald-500/5': premium.status === 'PAID'}">
                            <span class="font-bold text-surface-900 dark:text-white">₹{{ premium.amount | number }}</span>
                            <span class="text-surface-500">{{ premium.dueDate | date:'mediumDate' }}</span>
                            <span class="text-surface-500">{{ premium.paidDate ? (premium.paidDate | date:'mediumDate') : '—' }}</span>
                            <app-status-badge [status]="premium.status"></app-status-badge>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>

          <!-- Claims Log (narrower column) -->
          <div class="xl:col-span-2 glass-card overflow-hidden">
            <div class="p-6 border-b border-surface-200 dark:border-white/5 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-warning-500/10 flex items-center justify-center text-warning-500 border border-warning-500/20">
                  <svg lucideIcon="shield-alert" [size]="18"></svg>
                </div>
                <div>
                  <h2 class="font-bold text-surface-900 dark:text-white">Claims Log</h2>
                  <p class="text-[10px] text-surface-500 uppercase font-bold tracking-widest">{{ claims().length }} filed</p>
                </div>
              </div>
            </div>

            @if (claims().length === 0) {
              <div class="p-16 text-center text-surface-500 text-sm">No claims filed.</div>
            } @else {
              <div class="divide-y divide-surface-100 dark:divide-white/5">
                @for (claim of claims(); track claim.id) {
                  <div class="p-5 hover:bg-surface-50 dark:hover:bg-white/3 transition-colors">
                    <div class="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p class="font-bold text-surface-900 dark:text-white text-sm">Claim #{{ claim.id }}</p>
                        <p class="text-[10px] text-surface-500 uppercase font-bold tracking-widest mt-0.5">
                          Policy #{{ claim.policyId }}
                        </p>
                      </div>
                      <app-status-badge [status]="claim.status"></app-status-badge>
                    </div>

                    <div class="flex items-center justify-between mb-3">
                      <div>
                        <p class="text-[9px] uppercase font-bold text-surface-400 tracking-widest">Claim Amount</p>
                        <p class="text-base font-black text-surface-900 dark:text-white">₹{{ claim.amount | number }}</p>
                      </div>
                      <div class="text-right">
                        <p class="text-[9px] uppercase font-bold text-surface-400 tracking-widest">Filed On</p>
                        <p class="text-xs text-surface-500">{{ claim.timeOfCreation | date:'mediumDate' }}</p>
                      </div>
                    </div>

                    @if (claim.description) {
                      <p class="text-xs text-surface-500 dark:text-surface-400 italic border-l-2 border-surface-200 dark:border-white/10 pl-3 mb-3">
                        {{ claim.description }}
                      </p>
                    }

                    <!-- Document checklist -->
                    <div class="flex gap-3 text-[10px] font-bold">
                      <span [class]="claim.claimFormUploaded ? 'text-emerald-500' : 'text-surface-400'">
                        {{ claim.claimFormUploaded ? '✅' : '⬜' }} Form
                      </span>
                      <span [class]="claim.aadhaarCardUploaded ? 'text-emerald-500' : 'text-surface-400'">
                        {{ claim.aadhaarCardUploaded ? '✅' : '⬜' }} Aadhaar
                      </span>
                      <span [class]="claim.evidencesUploaded ? 'text-emerald-500' : 'text-surface-400'">
                        {{ claim.evidencesUploaded ? '✅' : '⬜' }} Evidence
                      </span>
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
export class AdminUserDetailComponent implements OnInit {

  loading = signal(true);
  error = signal<string | null>(null);
  customer = signal<UserResponse | null>(null);
  policies = signal<PolicyResponse[]>([]);
  claims = signal<ClaimResponse[]>([]);

  customerId!: number;

  totalPremiumPaid = computed(() =>
    this.policies().reduce((sum, p) => sum + this.getPaidPremiumsForPolicy(p), 0)
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private policyService: PolicyService,
    private claimService: ClaimService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.customerId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      customer: this.userService.getInfo(this.customerId).pipe(catchError(() => of(null))),
      policies: this.policyService.getAdminCustomerPolicies(this.customerId).pipe(catchError(() => of([]))),
      claims: this.claimService.getAdminCustomerClaims(this.customerId).pipe(catchError(() => of([])))
    }).subscribe({
      next: (res) => {
        this.customer.set(res.customer);
        this.policies.set(Array.isArray(res.policies) ? res.policies : []);
        this.claims.set(Array.isArray(res.claims) ? res.claims : []);
        if (!res.customer) {
          this.error.set('Could not retrieve customer profile data.');
        }
        this.loading.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.error.set('Failed to load customer data. Please try again.');
        this.loading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/policies']);
  }

  getInitials(): string {
    const c = this.customer();
    if (!c) return '?';
    return `${c.firstName?.charAt(0) || ''}${c.lastName?.charAt(0) || ''}`.toUpperCase();
  }

  getPaidPremiumsForPolicy(policy: PolicyResponse): number {
    return (policy.premiums || [])
      .filter(p => p.status === 'PAID')
      .reduce((s, p) => s + p.amount, 0);
  }

  getPaidCountForPolicy(policy: PolicyResponse): number {
    return (policy.premiums || []).filter(p => p.status === 'PAID').length;
  }

  formatAmount(amount: number): string {
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toLocaleString('en-IN');
  }

  getCategoryIcon(category: string): { icon: string; bg: string } {
    const map: Record<string, { icon: string; bg: string }> = {
      HEALTH:   { icon: 'heart-pulse', bg: 'bg-rose-500/10 text-rose-500' },
      AUTO:     { icon: 'car',         bg: 'bg-blue-500/10 text-blue-500' },
      HOME:     { icon: 'home',        bg: 'bg-amber-500/10 text-amber-500' },
      LIFE:     { icon: 'heart',       bg: 'bg-pink-500/10 text-pink-500' },
      TRAVEL:   { icon: 'plane',       bg: 'bg-cyan-500/10 text-cyan-500' },
      BUSINESS: { icon: 'briefcase',   bg: 'bg-violet-500/10 text-violet-500' },
    };
    return map[category] ?? { icon: 'shield', bg: 'bg-primary-500/10 text-primary-500' };
  }
}
