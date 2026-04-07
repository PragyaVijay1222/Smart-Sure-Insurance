import { Component, OnInit, signal, computed, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ClaimService } from '../../../core/services/claim.service';
import { UserService } from '../../../core/services/user.service';
import { PolicyService } from '../../../core/services/policy.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ClaimResponse, ClaimStatus, UserResponse, PolicyResponse } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LucideDynamicIcon } from '@lucide/angular';
import { catchError, finalize, of, forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-claims',
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
    <div class="px-4 sm:px-8 lg:px-16 py-8 max-w-[1600px] mx-auto animate-fade-in text-surface-950 dark:text-surface-50">
      
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold font-display text-surface-900 dark:text-white">Manage Claims</h1>
          <p class="text-surface-500 dark:text-surface-400">Review and process insurance claims across the system</p>
        </div>
        <div class="flex gap-3">
          <button (click)="loadClaims()" class="p-2 bg-surface-100 dark:bg-surface-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors">
            <svg lucideIcon="refresh-cw" [size]="20" [ngClass]="{'animate-spin': loading()}"></svg>
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-4 mb-8">
        <button 
          (click)="setStatusFilter('ALL')"
          [ngClass]="statusFilter() === 'ALL' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 hover:bg-surface-200'"
          class="px-5 py-2.5 rounded-xl text-sm font-bold transition-all">
          All Claims
        </button>
        <button 
          (click)="setStatusFilter('SUBMITTED')"
          [ngClass]="statusFilter() === 'SUBMITTED' ? 'bg-warning-500 text-white shadow-lg shadow-warning-500/20' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 hover:bg-surface-200'"
          class="px-5 py-2.5 rounded-xl text-sm font-bold transition-all">
          New Submissions
        </button>
        <button 
          (click)="setStatusFilter('UNDER_REVIEW')"
          [ngClass]="statusFilter() === 'UNDER_REVIEW' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 hover:bg-surface-200'"
          class="px-5 py-2.5 rounded-xl text-sm font-bold transition-all">
          In Review
        </button>
        <button 
          (click)="setStatusFilter('APPROVED')"
          [ngClass]="statusFilter() === 'APPROVED' ? 'bg-success-500 text-white shadow-lg shadow-success-500/20' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 hover:bg-surface-200'"
          class="px-5 py-2.5 rounded-xl text-sm font-bold transition-all">
          Approved
        </button>
      </div>

      @if (loading() && !selectedClaim()) {
        <div class="py-20">
          <app-loading-spinner />
        </div>
      } @else {
        <!-- Claims Table -->
        <div class="glass-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="bg-surface-50 dark:bg-white/5 text-surface-500 dark:text-surface-400">
                <tr>
                  <th class="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">ID</th>
                  <th class="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Date</th>
                  <th class="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Amount</th>
                  <th class="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Status</th>
                  <th class="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Docs</th>
                  <th class="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-surface-100 dark:divide-white/5 text-surface-900 dark:text-white">
                @for (claim of filteredClaims(); track claim.id) {
                  <tr class="hover:bg-surface-50 dark:hover:bg-white/5 transition-colors group">
                    <td class="px-6 py-4 font-mono font-medium text-primary-600 dark:text-primary-400">#{{ claim.id }}</td>
                    <td class="px-6 py-4">{{ claim.timeOfCreation | date:'mediumDate' }}</td>
                    <td class="px-6 py-4 font-bold">₹{{ claim.amount | number }}</td>
                    <td class="px-6 py-4"><app-status-badge [status]="claim.status"></app-status-badge></td>
                    <td class="px-6 py-4">
                      <div class="flex gap-1">
                        <span [title]="claim.aadhaarCardUploaded ? 'Aadhaar Uploaded' : 'Missing Aadhaar'" 
                              [class]="claim.aadhaarCardUploaded ? 'text-success-500' : 'text-surface-300'">
                          <svg lucideIcon="contact-2" [size]="14"></svg>
                        </span>
                        <span [title]="claim.evidencesUploaded ? 'Evidence Uploaded' : 'Missing Evidence'" 
                              [class]="claim.evidencesUploaded ? 'text-success-500' : 'text-surface-300'">
                          <svg lucideIcon="file-text" [size]="14"></svg>
                        </span>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <button (click)="viewDetail(claim.id)" class="text-primary-600 dark:text-primary-400 font-bold hover:underline">
                        Review
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="px-6 py-12 text-center text-surface-500">
                      No claims found matching the current filter.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Detailed Review Sidebar/Modal -->
      @if (selectedClaim()) {
        <div class="fixed inset-0 z-[100] flex items-center justify-end animate-in fade-in duration-300">
          <div class="absolute inset-0 bg-surface-950/40 backdrop-blur-sm" (click)="closeDetail()"></div>
          
          <div class="relative w-full max-w-2xl h-full bg-white dark:bg-surface-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            
            <!-- Sidebar Header -->
            <div class="p-6 border-b border-surface-200 dark:border-white/10 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <button (click)="closeDetail()" class="p-2 hover:bg-surface-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                  <svg lucideIcon="chevron-right" [size]="20"></svg>
                </button>
                <h2 class="text-xl font-bold font-display">Claim Review #{{ selectedClaim()?.id }}</h2>
              </div>
              <app-status-badge [status]="selectedClaim()!.status"></app-status-badge>
            </div>

            <!-- Sidebar Content -->
            <div class="flex-1 overflow-y-auto p-8 space-y-8">
              
              <!-- Customer Context -->
              <section class="space-y-4">
                <h3 class="text-xs font-bold uppercase tracking-widest text-primary-500 flex items-center gap-2">
                  <svg lucideIcon="user" [size]="14"></svg>
                  Claimant Details
                </h3>
                @if (loadingContext()) {
                  <div class="animate-pulse flex gap-4 p-4 border border-surface-200 dark:border-white/10 rounded-2xl">
                    <div class="w-12 h-12 rounded-full bg-surface-200 dark:bg-white/10"></div>
                    <div class="flex-1 space-y-2">
                      <div class="h-4 bg-surface-200 dark:bg-white/10 rounded w-1/3"></div>
                      <div class="h-3 bg-surface-200 dark:bg-white/10 rounded w-1/2"></div>
                    </div>
                  </div>
                } @else if (claimant()) {
                  <div class="p-4 bg-surface-50 dark:bg-white/5 rounded-2xl border border-surface-200 dark:border-white/10 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 font-bold">
                      {{ claimant()?.firstName?.charAt(0) }}{{ claimant()?.lastName?.charAt(0) }}
                    </div>
                    <div>
                      <p class="font-bold">{{ claimant()?.firstName }} {{ claimant()?.lastName }}</p>
                      <p class="text-xs text-surface-500">{{ claimant()?.email }}</p>
                    </div>
                  </div>
                }
              </section>

              <!-- Policy Overview & Premium Audit -->
              @if (policyContext()) {
                <section class="space-y-4">
                  <h3 class="text-xs font-bold uppercase tracking-widest text-secondary-500 flex items-center gap-2">
                    <svg lucideIcon="shield-check" [size]="14"></svg>
                    Policy & Premium Audit
                  </h3>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Policy Info -->
                    <div class="p-4 bg-surface-50 dark:bg-white/5 rounded-2xl border border-surface-200 dark:border-white/10">
                      <div class="flex items-center justify-between mb-3">
                        <span class="text-[10px] font-bold uppercase text-surface-500">Associated Policy</span>
                        <span class="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 text-[10px] font-bold rounded-lg uppercase">
                          {{ policyContext()?.policyType?.category }}
                        </span>
                      </div>
                      <p class="font-bold text-sm">{{ policyContext()?.policyType?.name }}</p>
                      <p class="text-xs text-surface-500 font-mono mt-1">{{ policyContext()?.policyNumber }}</p>
                    </div>

                    <!-- Coverage -->
                    <div class="p-4 bg-surface-50 dark:bg-white/5 rounded-2xl border border-surface-200 dark:border-white/10">
                      <p class="text-[10px] uppercase font-bold text-surface-500 mb-1">Max Coverage</p>
                      <p class="font-bold text-lg text-success-500">₹{{ policyContext()?.coverageAmount | number }}</p>
                    </div>

                    <!-- Premium Standing -->
                    <div class="md:col-span-2 p-5 bg-surface-50 dark:bg-white/5 rounded-2xl border border-surface-200 dark:border-white/10 relative overflow-hidden group">
                      <div class="flex items-center justify-between mb-4">
                        <div>
                          <p class="text-[10px] uppercase font-bold text-surface-500 mb-1">Premium Standing</p>
                          <h4 class="font-bold text-lg" [ngClass]="isFullyPaid() ? 'text-success-500' : 'text-warning-500'">
                            {{ isFullyPaid() ? 'All Premiums Paid' : premiumsLeft() + ' Installments Outstanding' }}
                          </h4>
                        </div>
                        <div class="text-right">
                          <p class="text-xs font-bold text-surface-500">{{ paidPremiums() }} / {{ totalPremiums() }} Paid</p>
                        </div>
                      </div>

                      <!-- Progress Bar -->
                      <div class="w-full h-2 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
                        <div 
                          class="h-full transition-all duration-1000"
                          [ngClass]="isFullyPaid() ? 'bg-success-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-warning-500'"
                          [style.width.%]="(paidPremiums() / totalPremiums()) * 100">
                        </div>
                      </div>
                      
                      @if (!isFullyPaid()) {
                        <p class="text-[10px] text-warning-500/80 font-medium mt-3 flex items-center gap-1.5 leading-none">
                          <svg lucideIcon="alert-circle" [size]="10"></svg>
                          Action required before claim settlement
                        </p>
                      } @else {
                        <p class="text-[10px] text-success-500 font-medium mt-3 flex items-center gap-1.5 leading-none">
                          <svg lucideIcon="check-circle" [size]="10"></svg>
                          Ready for disbursement
                        </p>
                      }
                    </div>
                  </div>
                </section>
              }

              <!-- Incident Information -->
              <section class="space-y-4">
                <h3 class="text-xs font-bold uppercase tracking-widest text-accent-500 flex items-center gap-2">
                  <svg lucideIcon="alert-triangle" [size]="14"></svg>
                  Incident Particulars
                </h3>
                <div class="grid grid-cols-2 gap-4">
                  <div class="p-4 rounded-xl bg-surface-50 dark:bg-white/5 border border-surface-200 dark:border-white/10">
                    <p class="text-[10px] uppercase font-bold text-surface-500 mb-1">Date</p>
                    <p class="font-bold text-sm">{{ selectedClaim()?.incidentDate | date:'mediumDate' }}</p>
                  </div>
                  <div class="p-4 rounded-xl bg-surface-50 dark:bg-white/5 border border-surface-200 dark:border-white/10">
                    <p class="text-[10px] uppercase font-bold text-surface-500 mb-1">Location</p>
                    <p class="font-bold text-sm">{{ selectedClaim()?.incidentLocation }}</p>
                  </div>
                  <div class="col-span-2 p-4 rounded-xl bg-surface-50 dark:bg-white/5 border border-surface-200 dark:border-white/10">
                    <p class="text-[10px] uppercase font-bold text-surface-500 mb-1">Description</p>
                    <p class="text-sm leading-relaxed text-surface-700 dark:text-surface-300">{{ selectedClaim()?.description }}</p>
                  </div>
                </div>
              </section>

              <!-- Document Verification -->
              <section class="space-y-4">
               <div class="flex items-center justify-between">
                  <h3 class="text-xs font-bold uppercase tracking-widest text-success-500 flex items-center gap-2">
                    <svg lucideIcon="file-check" [size]="14"></svg>
                    Evidence & Documents
                  </h3>
                  <span class="text-[10px] text-surface-400">Click to preview/download</span>
               </div>
                <div class="space-y-3">
                  <button 
                    (click)="downloadDoc('aadhaar')"
                    [disabled]="!selectedClaim()?.aadhaarCardUploaded"
                    class="w-full p-4 flex items-center justify-between rounded-2xl border transition-all"
                    [ngClass]="selectedClaim()?.aadhaarCardUploaded ? 'border-success-500/20 bg-success-500/5 hover:bg-success-500/10' : 'border-surface-200 dark:border-white/10 opacity-50 grayscale cursor-not-allowed'">
                    <div class="flex items-center gap-3 text-sm font-bold">
                      <svg lucideIcon="contact-2" [size]="18" class="text-success-500"></svg>
                      Aadhaar / KYC ID
                    </div>
                    @if (selectedClaim()?.aadhaarCardUploaded) {
                      <svg lucideIcon="download" [size]="16" class="text-surface-400"></svg>
                    }
                  </button>

                  <button 
                    (click)="downloadDoc('evidence')"
                    [disabled]="!selectedClaim()?.evidencesUploaded"
                    class="w-full p-4 flex items-center justify-between rounded-2xl border transition-all"
                    [ngClass]="selectedClaim()?.evidencesUploaded ? 'border-primary-500/20 bg-primary-500/5 hover:bg-primary-500/10' : 'border-surface-200 dark:border-white/10 opacity-50 grayscale cursor-not-allowed'">
                    <div class="flex items-center gap-3 text-sm font-bold">
                      <svg lucideIcon="receipt" [size]="18" class="text-primary-500"></svg>
                      Bills & Evidence
                    </div>
                    @if (selectedClaim()?.evidencesUploaded) {
                      <svg lucideIcon="download" [size]="16" class="text-surface-400"></svg>
                    }
                  </button>
                </div>
              </section>
            </div>

            <!-- Action Bar -->
            <div class="p-8 border-t border-surface-200 dark:border-white/10 bg-surface-50 dark:bg-white/5">
              <div class="flex gap-3">
                @if (selectedClaim()?.status === 'SUBMITTED') {
                  <button (click)="updateStatus('UNDER_REVIEW')" [disabled]="processing()" class="flex-1 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-bold shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center gap-2">
                    @if (processing()) { <app-loading-spinner [size]="18" color="white" /> }
                    Mark as In Review
                  </button>
                } @else if (selectedClaim()?.status === 'UNDER_REVIEW') {
                  <button (click)="updateStatus('REJECTED')" [disabled]="processing()" class="flex-1 py-4 bg-danger-500 hover:bg-danger-600 text-white rounded-2xl font-bold shadow-xl shadow-danger-500/20 transition-all flex items-center justify-center gap-2">
                    Reject Claim
                  </button>
                  <button (click)="updateStatus('APPROVED')" [disabled]="processing()" class="flex-1 py-4 bg-success-500 hover:bg-success-600 text-white rounded-2xl font-bold shadow-xl shadow-success-500/20 transition-all flex items-center justify-center gap-2">
                    Approve Claim
                  </button>
                } @else if (selectedClaim()?.status === 'APPROVED' || selectedClaim()?.status === 'REJECTED') {
                   <button (click)="updateStatus('CLOSED')" [disabled]="processing()" class="w-full py-4 bg-surface-800 hover:bg-surface-900 text-white rounded-2xl font-bold transition-all">
                     Close Claim File
                   </button>
                } @else {
                  <p class="text-center w-full text-xs font-bold uppercase tracking-widest text-surface-400">No further actions available for this status.</p>
                }
              </div>
            </div>

          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .glass-card {
      @apply bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-white/5 shadow-card;
    }
  `]
})
export class AdminClaimsComponent implements OnInit {
  claims = signal<ClaimResponse[]>([]);
  loading = signal(true);
  statusFilter = signal<string>('ALL');
  processing = signal(false);

  // Selected Detail State
  selectedClaim = signal<ClaimResponse | null>(null);
  claimant = signal<UserResponse | null>(null);
  policyContext = signal<PolicyResponse | null>(null);
  loadingContext = signal(false);

  // New calculated signals
  totalPremiums = computed(() => this.policyContext()?.premiums?.length || 0);
  paidPremiums = computed(() => this.policyContext()?.premiums?.filter(p => p.status === 'PAID').length || 0);
  premiumsLeft = computed(() => this.totalPremiums() - this.paidPremiums());
  isFullyPaid = computed(() => this.totalPremiums() > 0 && this.premiumsLeft() === 0);

  filteredClaims = computed(() => {
    const list = this.claims();
    const filter = this.statusFilter();
    if (filter === 'ALL') return list;
    return list.filter(c => c.status === filter);
  });

  constructor(
    private claimService: ClaimService,
    private userService: UserService,
    private policyService: PolicyService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Check if we came from dashboard with a specific ID
    const directId = this.route.snapshot.paramMap.get('id');

    this.loadClaims().then(() => {
      if (directId) {
        this.viewDetail(+directId);
      }
    });

    // Also look for query params or direct sub-route if needed
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.viewDetail(+params['id']);
      }
    });
  }

  async loadClaims(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await new Promise<ClaimResponse[]>((resolve, reject) => {
        this.claimService.getAllClaims().subscribe({
          next: resolve,
          error: reject
        });
      });
      // Sort by creation time descending
      this.claims.set(data.sort((a, b) => b.id - a.id));
    } catch (err) {
      this.notificationService.error('Fetch Error', 'Failed to load claims database.');
    } finally {
      this.loading.set(false);
      this.cdr.detectChanges();
    }
  }

  setStatusFilter(status: string): void {
    this.statusFilter.set(status);
  }

  async viewDetail(id: number): Promise<void> {
    const claim = this.claims().find(c => c.id === id);
    if (!claim) {
      // If not in current list (maybe filtered or paginated), fetch direct
      this.loading.set(true);
      this.claimService.getClaimById(id).subscribe({
        next: (res) => {
          this.selectedClaim.set(res);
          this.fetchContext(res);
          this.loading.set(false);
          this.cdr.detectChanges();
        },
        error: () => {
          this.notificationService.error('Error', 'Claim not found.');
          this.loading.set(false);
          this.cdr.detectChanges();
        }
      });
      return;
    }

    this.selectedClaim.set(claim);
    this.fetchContext(claim);
  }

  fetchContext(claim: ClaimResponse): void {
    this.loadingContext.set(true);
    this.claimant.set(null);
    this.policyContext.set(null);

    // 1. Fetch full policy details including premiums from Policy Service
    // We use claim.policyId directly which is more reliable
    this.policyService.getPolicyById(claim.policyId).subscribe({
      next: (fullPolicy) => {
        this.policyContext.set(fullPolicy);
        
        // 2. Then get customer info
        this.userService.getInfo(fullPolicy.customerId).subscribe({
          next: (user) => {
            this.claimant.set(user);
            this.loadingContext.set(false);
            this.cdr.detectChanges();
          },
          error: () => {
            console.error('Failed to fetch user info for customer:', fullPolicy.customerId);
            this.loadingContext.set(false);
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error('Failed to fetch policy details for claim:', claim.id, err);
        this.loadingContext.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  closeDetail(): void {
    this.selectedClaim.set(null);
    this.claimant.set(null);
    this.policyContext.set(null);
    // Remove ID from URL without reloading
    this.router.navigate(['/admin/claims'], { replaceUrl: true });
  }

  async updateStatus(nextStatus: string): Promise<void> {
    const claim = this.selectedClaim();
    if (!claim) return;

    this.processing.set(true);
    this.claimService.moveToStatus(claim.id, nextStatus as any).subscribe({
      next: (updated) => {
        this.notificationService.success('Status Updated', `Claim #${claim.id} is now ${nextStatus}`);
        this.selectedClaim.set(updated);
        // Update in list
        this.claims.update(list => list.map(c => c.id === updated.id ? updated : c));
        this.processing.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.notificationService.error('Sync Error', err?.error?.message || 'Failed to update status.');
        this.processing.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  downloadDoc(type: 'aadhaar' | 'evidence'): void {
    const claim = this.selectedClaim();
    if (!claim) return;

    const stream = type === 'aadhaar'
      ? this.claimService.downloadAadhaarCard(claim.id)
      : this.claimService.downloadEvidence(claim.id);

    stream.subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `claim_${claim.id}_${type}.${type === 'aadhaar' ? 'jpg' : 'png'}`;
        link.click();
      },
      error: () => this.notificationService.error('Download Failed', 'Could not retrieve file from server.')
    });
  }
}
