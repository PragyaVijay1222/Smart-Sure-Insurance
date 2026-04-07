import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ClaimService } from '../../../core/services/claim.service';
import { ClaimResponse } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LucideDynamicIcon, LucideArrowLeft, LucideCalendar, LucideMapPin, LucideFileText, LucideCheckCircle, LucideAlertCircle } from '@lucide/angular';

@Component({
  selector: 'app-claim-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, StatusBadgeComponent, LucideDynamicIcon],
  template: `
    <div class="px-4 py-8 max-w-4xl mx-auto animate-fade-in">
      
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <button (click)="goBack()" class="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <svg lucideIcon="arrow-left" [size]="24" class="text-surface-600 dark:text-surface-300"></svg>
        </button>
        <div>
          <h1 class="text-3xl font-bold font-display text-surface-900 dark:text-white">Claim Details</h1>
          <p class="text-surface-500 dark:text-surface-400">Review status and incident information</p>
        </div>
      </div>

      @if (loading) {
        <app-loading-spinner />
      } @else if (claim) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Info Column -->
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-card border border-surface-200 dark:border-surface-700">
              <div class="flex items-center justify-between mb-6">
                <span class="text-xs font-bold uppercase tracking-widest text-surface-400">Claim ID: CLM-{{ claim.id.toString().padStart(5, '0') }}</span>
                <app-status-badge [status]="claim.status"></app-status-badge>
              </div>

              <div class="space-y-4">
                <div class="flex items-start gap-4">
                  <div class="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center text-primary-500">
                    <svg lucideIcon="calendar" [size]="20"></svg>
                  </div>
                  <div>
                    <p class="text-xs text-surface-500 uppercase font-bold tracking-tight">Incident Date</p>
                    <p class="font-semibold text-surface-900 dark:text-white">{{ claim.incidentDate | date:'fullDate' }}</p>
                  </div>
                </div>

                <div class="flex items-start gap-4">
                  <div class="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center text-primary-500">
                    <svg lucideIcon="map-pin" [size]="20"></svg>
                  </div>
                  <div>
                    <p class="text-xs text-surface-500 uppercase font-bold tracking-tight">Location</p>
                    <p class="font-semibold text-surface-900 dark:text-white">{{ claim.incidentLocation }}</p>
                  </div>
                </div>

                <div class="pt-4 border-t border-surface-100 dark:border-surface-700/50">
                  <p class="text-xs text-surface-500 uppercase font-bold tracking-tight mb-2">Detailed Description</p>
                  <p class="text-surface-700 dark:text-surface-300 leading-relaxed italic">"{{ claim.description }}"</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary & Files Column -->
          <div class="space-y-6">
            <div class="bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-card border border-surface-200 dark:border-surface-700">
              <h3 class="font-bold text-surface-900 dark:text-white mb-4">Financial Summary</h3>
              <div class="flex justify-between items-center py-2">
                <span class="text-surface-500">Total Claim</span>
                <span class="text-xl font-bold text-surface-900 dark:text-white">₹{{ claim.amount | number }}</span>
              </div>
              <p class="text-[10px] text-surface-400 mt-2">Claimed on Policy #{{ claim.policyId }}</p>
            </div>

            <div class="bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-card border border-surface-200 dark:border-surface-700">
              <h3 class="font-bold text-surface-900 dark:text-white mb-4">Verification Artifacts</h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-900/50">
                  <div class="flex items-center gap-3">
                    <svg lucideIcon="file-text" [size]="16" class="text-surface-400"></svg>
                    <span class="text-sm font-medium text-surface-700 dark:text-surface-300">Aadhaar / KYC</span>
                  </div>
                  <svg [lucideIcon]="claim.aadhaarCardUploaded ? 'check-circle' : 'alert-circle'" 
                       [size]="16" [class]="claim.aadhaarCardUploaded ? 'text-success-500' : 'text-danger-500'"></svg>
                </div>
                <div class="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-900/50">
                  <div class="flex items-center gap-3">
                    <svg lucideIcon="file-text" [size]="16" class="text-surface-400"></svg>
                    <span class="text-sm font-medium text-surface-700 dark:text-surface-300">Evidence / Bills</span>
                  </div>
                  <svg [lucideIcon]="claim.evidencesUploaded ? 'check-circle' : 'alert-circle'" 
                       [size]="16" [class]="claim.evidencesUploaded ? 'text-success-500' : 'text-danger-500'"></svg>
                </div>
              </div>
            </div>
          </div>

        </div>
      } @else {
        <div class="p-12 text-center text-surface-400">Claim not found.</div>
      }
    </div>
  `,
})
export class ClaimDetailComponent implements OnInit {
  claim: ClaimResponse | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private claimService: ClaimService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.claimService.getClaimById(id).subscribe({
        next: (res) => {
          this.claim = res;
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
    }
  }

  goBack(): void {
    this.location.back();
  }
}
