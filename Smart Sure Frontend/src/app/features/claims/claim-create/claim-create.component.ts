import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PolicyService } from '../../../core/services/policy.service';
import { ClaimService } from '../../../core/services/claim.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PolicyResponse, ClaimRequest } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideDynamicIcon, LucideArrowLeft, LucideFileText, LucideUpload, LucideCircleCheck, LucideCircleAlert } from '@lucide/angular';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-claim-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, LucideDynamicIcon],
  template: `
    <div class="px-4 py-8 max-w-4xl mx-auto animate-fade-in">
      
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <button (click)="goBack()" class="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <svg lucideIcon="arrow-left" [size]="24" class="text-surface-600 dark:text-surface-300"></svg>
        </button>
        <div>
          <h1 class="text-3xl font-bold font-display text-surface-900 dark:text-white">File a Claim</h1>
          <p class="text-surface-500 dark:text-surface-400">Submit documents to initiate your claim process</p>
        </div>
      </div>

      <div class="bg-white dark:bg-surface-800 rounded-2xl p-6 md:p-8 shadow-card border border-surface-200 dark:border-surface-700">
        
        <form [formGroup]="claimForm" (ngSubmit)="submitClaim()" class="space-y-6">
          
          <!-- Select Policy -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Select Active Policy</label>
              @if (loadingPolicies) {
                <div class="animate-pulse h-12 bg-surface-100 dark:bg-surface-700 rounded-xl"></div>
              } @else if (policies.length === 0) {
                <div class="p-4 bg-warning-50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300 rounded-xl flex items-start gap-3">
                  <svg lucideIcon="circle-alert" [size]="20" class="shrink-0"></svg>
                  <p class="text-sm">You do not have any active policies eligible for a claim.</p>
                </div>
              } @else {
                <select formControlName="policyId" (change)="onPolicySelect()" class="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none">
                  <option value="" disabled>Select a Policy...</option>
                  @for (policy of policies; track policy.id) {
                    <option [value]="policy.id">{{ policy.policyType.name }} ({{ policy.policyNumber }})</option>
                  }
                </select>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Claim Amount (₹)</label>
              <input type="number" formControlName="amount" placeholder="Enter amount..." 
                     class="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none">
              <p class="text-[10px] text-surface-500 mt-1">Maximum coverage available for selected policy.</p>
            </div>
          </div>

          <!-- Incident Details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Date of Incident</label>
              <input type="date" formControlName="incidentDate" 
                     class="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none">
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Location</label>
              <input type="text" formControlName="incidentLocation" placeholder="Where did it happen?" 
                     class="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none">
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Description of Incident</label>
            <textarea formControlName="description" rows="4" placeholder="Please describe what happened in detail..." 
                      class="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none"></textarea>
          </div>

          <!-- File Uploads -->
          <div class="space-y-4 pt-4 border-t border-surface-200 dark:border-surface-700">
            <h3 class="font-bold text-surface-900 dark:text-white mb-2">Verification Documents</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Aadhaar Card -->
              <div class="p-4 border-2 border-dashed rounded-xl transition-all" 
                   [ngClass]="aadhaarFile ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-surface-300 dark:border-surface-600 hover:border-primary-400'">
                <label class="flex flex-col items-center justify-center cursor-pointer h-full min-h-[5rem]">
                  <input type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png" (change)="onFileSelect($event, 'aadhaar')">
                  @if (aadhaarFile) {
                    <svg lucideIcon="circle-check" [size]="24" class="text-primary-500 mb-2"></svg>
                    <span class="text-sm font-medium text-surface-900 dark:text-white text-center">{{ aadhaarFile.name }}</span>
                    <span class="text-[10px] text-primary-600 mt-1 cursor-pointer hover:underline">Change File</span>
                  } @else {
                    <svg lucideIcon="upload" [size]="24" class="text-surface-400 mb-2"></svg>
                    <span class="text-sm font-medium text-surface-700 dark:text-surface-300 text-center">Upload Aadhaar / KYC Document</span>
                    <span class="text-[10px] text-surface-500 mt-1">PDF, JPG, PNG (Max 5MB)</span>
                  }
                </label>
              </div>

              <!-- Evidences -->
              <div class="p-4 border-2 border-dashed rounded-xl transition-all" 
                   [ngClass]="evidenceFile ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-surface-300 dark:border-surface-600 hover:border-primary-400'">
                <label class="flex flex-col items-center justify-center cursor-pointer h-full min-h-[5rem]">
                  <input type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png,.zip" (change)="onFileSelect($event, 'evidence')">
                  @if (evidenceFile) {
                    <svg lucideIcon="circle-check" [size]="24" class="text-primary-500 mb-2"></svg>
                    <span class="text-sm font-medium text-surface-900 dark:text-white text-center">{{ evidenceFile.name }}</span>
                    <span class="text-[10px] text-primary-600 mt-1 cursor-pointer hover:underline">Change File</span>
                  } @else {
                    <svg lucideIcon="upload" [size]="24" class="text-surface-400 mb-2"></svg>
                    <span class="text-sm font-medium text-surface-700 dark:text-surface-300 text-center">Supporting Evidence / Bills</span>
                    <span class="text-[10px] text-surface-500 mt-1">Images, PDFs or ZIP (Max 5MB)</span>
                  }
                </label>
              </div>
            </div>
          </div>

          <div class="pt-6 flex justify-end gap-4">
            <button type="button" (click)="goBack()" [disabled]="submitting" class="px-6 py-3 bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-300 rounded-xl font-semibold transition-all">
              Cancel
            </button>
            <button type="submit" [disabled]="claimForm.invalid || !aadhaarFile || !evidenceFile || submitting" class="flex items-center gap-2 px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50">
              @if (submitting) {
                <app-loading-spinner [size]="20" color="white" /> Submitting...
              } @else {
                <svg lucideIcon="file-text" [size]="18"></svg> Submit Claim
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ClaimCreateComponent implements OnInit {
  policies: PolicyResponse[] = [];
  loadingPolicies = true;
  submitting = false;
  claimForm!: FormGroup;

  aadhaarFile: File | null = null;
  evidenceFile: File | null = null;

  readonly ArrowLeft = LucideArrowLeft;
  readonly FileText = LucideFileText;
  readonly Upload = LucideUpload;
  readonly CircleCheck = LucideCircleCheck;
  readonly CircleAlert = LucideCircleAlert;

  constructor(
    private formBuilder: FormBuilder,
    private policyService: PolicyService,
    private claimService: ClaimService,
    private notificationService: NotificationService,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.claimForm = this.formBuilder.group({
      policyId: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      incidentDate: ['', Validators.required],
      incidentLocation: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(20)]]
    });

    this.fetchEligiblePolicies();
  }

  fetchEligiblePolicies(): void {
    this.policyService.getMyPolicies(0, 50).subscribe({
      next: (res) => {
        this.policies = res.content.filter(p => p.status === 'ACTIVE');
        this.loadingPolicies = false;
      },
      error: () => {
        this.notificationService.error('Error', 'Failed to load eligible policies.');
        this.loadingPolicies = false;
      }
    });
  }

  onPolicySelect(): void {
    const policyId = this.claimForm.value.policyId;
    const selectedPolicy = this.policies.find(p => p.id === +policyId);
    if (selectedPolicy) {
      this.claimForm.patchValue({
        amount: selectedPolicy.coverageAmount
      });
      this.claimForm.get('amount')?.setValidators([
        Validators.required, 
        Validators.min(1), 
        Validators.max(selectedPolicy.coverageAmount)
      ]);
      this.claimForm.get('amount')?.updateValueAndValidity();
    }
  }

  onFileSelect(event: any, type: 'aadhaar' | 'evidence'): void {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.notificationService.error('File too large', 'Max file size is 5MB.');
      event.target.value = '';
      return;
    }

    if (type === 'aadhaar') this.aadhaarFile = file;
    if (type === 'evidence') this.evidenceFile = file;
  }

  goBack(): void {
    this.location.back();
  }

  async submitClaim(): Promise<void> {
    if (this.claimForm.invalid || !this.aadhaarFile || !this.evidenceFile) {
      this.notificationService.error('Validation', 'Please fill all required fields and upload documents.');
      return;
    }

    this.submitting = true;

    try {
      // 1. Create Claim with Form Data
      const request: ClaimRequest = {
        ...this.claimForm.value,
        policyId: +this.claimForm.value.policyId
      };
      
      const claim = await firstValueFrom(this.claimService.createClaim(request));
      
      // 2. Upload Verification Documents Sequentially (to avoid race conditions)
      if (this.aadhaarFile) {
        await firstValueFrom(this.claimService.uploadAadhaarCard(claim.id, this.aadhaarFile));
      }
      if (this.evidenceFile) {
        await firstValueFrom(this.claimService.uploadEvidence(claim.id, this.evidenceFile));
      }

      // 3. Mark as Submitted
      await firstValueFrom(this.claimService.submitClaim(claim.id));

      this.notificationService.success('Claim Submitted', 'Your claim has been successfully submitted for review.');
      this.router.navigate(['/claims', claim.id]);
    } catch (err: any) {
      console.error('--- Submission Error Detail ---');
      console.error(err);
      this.notificationService.error('Submission Failed', err?.error?.Error || err?.error?.message || 'Failed to submit the claim.');
    } finally {
      this.submitting = false;
    }
  }
}
