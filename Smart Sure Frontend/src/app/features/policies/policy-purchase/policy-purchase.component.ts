import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PolicyService } from '../../../core/services/policy.service';
import { PaymentService } from '../../../core/services/payment.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PolicyTypeService } from '../../../core/services/policy-type.service';
import { PolicyTypeResponse, PolicyPurchaseRequest, PaymentRequest } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideDynamicIcon, LucideArrowLeft, LucideShieldCheck, LucideUser, LucideCreditCard, LucideChevronRight, LucideCircleCheck } from '@lucide/angular';

declare var Razorpay: any;

@Component({
  selector: 'app-policy-purchase',
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
          <h1 class="text-3xl font-bold font-display text-surface-900 dark:text-white">Purchase Policy</h1>
          <p class="text-surface-500 dark:text-surface-400">Complete your secure checkout</p>
        </div>
      </div>

      @if (loadingType) {
        <app-loading-spinner />
      } @else if (policyType) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Form Section -->
          <div class="lg:col-span-2">
            
            <!-- Stepper -->
            <div class="flex items-center mb-8 relative">
              <div class="absolute left-0 top-1/2 w-full h-0.5 bg-surface-200 dark:bg-surface-700 -z-10 -translate-y-1/2"></div>
              <div class="absolute left-0 top-1/2 h-0.5 bg-primary-500 -z-10 -translate-y-1/2 transition-all duration-500" [style.width]="(currentStep - 1) * 50 + '%'"></div>
              
              <div class="flex-1 flex justify-between">
                <!-- Step 1 -->
                <div class="flex flex-col items-center gap-2">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors" [ngClass]="currentStep >= 1 ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-surface-200 text-surface-500 dark:bg-surface-700'">
                    <svg lucideIcon="shield-check" [size]="20"></svg>
                  </div>
                  <span class="text-xs font-semibold" [ngClass]="currentStep >= 1 ? 'text-primary-600 dark:text-primary-400' : 'text-surface-500'">Coverage</span>
                </div>
                <!-- Step 2 -->
                <div class="flex flex-col items-center gap-2">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors" [ngClass]="currentStep >= 2 ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-surface-200 text-surface-500 dark:bg-surface-700'">
                    <svg lucideIcon="user" [size]="20"></svg>
                  </div>
                  <span class="text-xs font-semibold" [ngClass]="currentStep >= 2 ? 'text-primary-600 dark:text-primary-400' : 'text-surface-500'">Nominee</span>
                </div>
                <!-- Step 3 -->
                <div class="flex flex-col items-center gap-2">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors" [ngClass]="currentStep >= 3 ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-surface-200 text-surface-500 dark:bg-surface-700'">
                    <svg lucideIcon="circle-check" [size]="20"></svg>
                  </div>
                  <span class="text-xs font-semibold" [ngClass]="currentStep >= 3 ? 'text-primary-600 dark:text-primary-400' : 'text-surface-500'">Confirm</span>
                </div>
              </div>
            </div>

            <!-- Form -->
            <form [formGroup]="purchaseForm" class="bg-white dark:bg-surface-800 rounded-2xl p-6 md:p-8 shadow-card border border-surface-200 dark:border-surface-700">
              
              <!-- STEP 1: Coverage details -->
              <div *ngIf="currentStep === 1" class="animate-fade-in space-y-5">
                <h3 class="text-xl font-bold text-surface-900 dark:text-white mb-4">Coverage Details</h3>
                
                <div>
                  <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Coverage Amount (₹)</label>
                  <input type="number" formControlName="coverageAmount" class="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none" [max]="policyType.maxCoverageAmount">
                  <p class="text-xs text-surface-500 mt-1">Max allowed: ₹{{ policyType.maxCoverageAmount | number }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Customer Age</label>
                  <input type="number" formControlName="customerAge" class="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none">
                </div>

                <div>
                  <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Payment Frequency</label>
                  <select formControlName="paymentFrequency" class="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none">
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="SEMI_ANNUAL">Semi-Annually</option>
                    <option value="ANNUAL">Annually</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Start Date</label>
                  <input type="date" formControlName="startDate" class="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none">
                </div>

                <div class="pt-4 flex justify-end">
                  <button type="button" (click)="nextStep()" class="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/20 transition-all">
                    Next <svg lucideIcon="chevron-right" [size]="18"></svg>
                  </button>
                </div>
              </div>

              <!-- STEP 2: Nominee -->
              <div *ngIf="currentStep === 2" class="animate-fade-in space-y-5">
                <h3 class="text-xl font-bold text-surface-900 dark:text-white mb-4">Nominee Information</h3>
                
                <div>
                  <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Nominee Full Name (Optional)</label>
                  <input type="text" formControlName="nomineeName" placeholder="E.g. Jane Doe" class="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none">
                </div>

                <div>
                  <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Relationship to you</label>
                  <select formControlName="nomineeRelation" class="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none">
                    <option value="">Select Relation</option>
                    <option value="SPOUSE">Spouse</option>
                    <option value="CHILD">Child</option>
                    <option value="PARENT">Parent</option>
                    <option value="SIBLING">Sibling</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div class="pt-4 flex justify-between">
                  <button type="button" (click)="prevStep()" class="px-6 py-3 bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-300 rounded-xl font-semibold transition-all">
                    Back
                  </button>
                  <button type="button" (click)="nextStep()" class="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/20 transition-all">
                    Next <svg lucideIcon="chevron-right" [size]="18"></svg>
                  </button>
                </div>
              </div>

              <!-- STEP 3: Confirm -->
              <div *ngIf="currentStep === 3" class="animate-fade-in space-y-5">
                <h3 class="text-xl font-bold text-surface-900 dark:text-white mb-4">Review & Confirm</h3>
                
                <div class="p-4 bg-surface-50 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 space-y-3">
                  <div class="flex justify-between text-sm">
                    <span class="text-surface-500">Plan</span>
                    <span class="font-semibold text-surface-900 dark:text-white">{{ policyType.name }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-surface-500">Coverage</span>
                    <span class="font-semibold text-surface-900 dark:text-white">₹{{ purchaseForm.value.coverageAmount | number }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-surface-500">Base Premium</span>
                    <span class="font-semibold text-surface-900 dark:text-white">₹{{ policyType.basePremium | number }} / mo</span>
                  </div>
                </div>

                <p class="text-xs text-surface-500 text-center flex items-center justify-center gap-2">
                  <svg lucideIcon="shield-check" [size]="14"></svg> You can pay the premium monthly from your dashboard.
                </p>

                <div class="pt-4 flex justify-between gap-4">
                  <button type="button" (click)="prevStep()" [disabled]="processingPayment" class="px-6 py-3 bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-300 rounded-xl font-semibold transition-all disabled:opacity-50">
                    Back
                  </button>
                  <button type="button" (click)="submitPurchase()" [disabled]="processingPayment" class="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white rounded-xl font-semibold shadow-lg shadow-accent-500/20 transition-all disabled:opacity-70">
                    @if (processingPayment) {
                      <app-loading-spinner [size]="20" color="white" /> Processing...
                    } @else {
                      Confirm Purchase
                    }
                  </button>
                </div>
              </div>

            </form>
          </div>

          <!-- Summary Sidebar -->
          <div class="lg:col-span-1 hidden lg:block">
            <div class="bg-gradient-to-br from-primary-900 to-primary-950 rounded-2xl p-6 text-white shadow-card sticky top-24">
              <div class="flex items-center gap-3 mb-6 opacity-80">
                <svg lucideIcon="shield-check" [size]="28" class="text-primary-300"></svg>
                <span class="font-bold tracking-widest uppercase text-xs text-primary-300">Smart Sure Security</span>
              </div>
              <h4 class="text-xl font-bold mb-2">{{ policyType.name }}</h4>
              <p class="text-primary-200 text-sm mb-6">{{ policyType.description }}</p>
              
              <ul class="space-y-3 text-sm text-primary-100 mb-8">
                <li class="flex items-start gap-2">
                  <svg lucideIcon="circle-check" [size]="18" class="text-accent-400 shrink-0 mt-0.5"></svg>
                  <span>Instant digital policy issuance</span>
                </li>
                <li class="flex items-start gap-2">
                  <svg lucideIcon="circle-check" [size]="18" class="text-accent-400 shrink-0 mt-0.5"></svg>
                  <span>Term: {{ policyType.termMonths }} months</span>
                </li>
                <li class="flex items-start gap-2">
                  <svg lucideIcon="circle-check" [size]="18" class="text-accent-400 shrink-0 mt-0.5"></svg>
                  <span>Deductible: ₹{{ policyType.deductibleAmount | number }}</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      }
    </div>
  `,
})
export class PolicyPurchaseComponent implements OnInit {
  policyType: PolicyTypeResponse | null = null;
  loadingType = true;
  currentStep = 1;
  purchaseForm!: FormGroup;
  processingPayment = false;

  readonly ArrowLeft = LucideArrowLeft;
  readonly ShieldCheck = LucideShieldCheck;
  readonly User = LucideUser;
  readonly CreditCard = LucideCreditCard;
  readonly ChevronRight = LucideChevronRight;
  readonly CircleCheck = LucideCircleCheck;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private policyTypeService: PolicyTypeService,
    private policyService: PolicyService,
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    const typeId = this.route.snapshot.queryParamMap.get('typeId');
    if (!typeId) {
      this.notificationService.error('Missing policy type', 'Cannot start purchase');
      this.router.navigate(['/']);
      return;
    }

    this.policyTypeService.getPolicyTypeById(+typeId).subscribe({
      next: (res) => {
        this.policyType = res;
        this.initForm();
        this.loadingType = false;
      },
      error: () => {
        this.notificationService.error('Error', 'Failed to load policy type details');
        this.router.navigate(['/']);
      }
    });

    this.loadRazorpayScript();
  }

  initForm(): void {
    const today = new Date().toISOString().split('T')[0];
    this.purchaseForm = this.fb.group({
      coverageAmount: [this.policyType?.maxCoverageAmount || 0, [Validators.required, Validators.min(1000)]],
      customerAge: [30, [Validators.required, Validators.min(18), Validators.max(100)]],
      paymentFrequency: ['MONTHLY', Validators.required],
      startDate: [today, Validators.required],
      nomineeName: [''],
      nomineeRelation: ['']
    });
  }

  loadRazorpayScript(): void {
    if ((window as any).Razorpay) return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }

  goBack(): void {
    this.location.back();
  }

  nextStep(): void {
    if (this.currentStep === 1) {
      const step1Valid = this.purchaseForm.get('coverageAmount')?.valid && this.purchaseForm.get('customerAge')?.valid && this.purchaseForm.get('paymentFrequency')?.valid && this.purchaseForm.get('startDate')?.valid;
      if (!step1Valid) {
        this.notificationService.error('Validation Error', 'Please fill all required coverage details correctly.');
        return;
      }
    }
    this.currentStep++;
  }

  prevStep(): void {
    this.currentStep--;
  }

  submitPurchase(): void {
    if (this.purchaseForm.invalid || !this.policyType) return;
    
    this.processingPayment = true;
    
    const request: PolicyPurchaseRequest = {
      policyTypeId: this.policyType.id,
      coverageAmount: this.purchaseForm.value.coverageAmount,
      paymentFrequency: this.purchaseForm.value.paymentFrequency,
      startDate: this.purchaseForm.value.startDate,
      nomineeName: this.purchaseForm.value.nomineeName,
      nomineeRelation: this.purchaseForm.value.nomineeRelation,
      customerAge: this.purchaseForm.value.customerAge
    };

    // Create Policy
    this.policyService.purchasePolicy(request).subscribe({
      next: (policy) => {
        this.processingPayment = false;
        this.notificationService.success('Success', 'Policy purchased successfully!');
        this.router.navigate(['/policies', policy.id]);
      },
      error: (err) => {
        this.processingPayment = false;
        this.notificationService.error('Purchase Failed', err.error?.message || 'Could not create policy.');
      }
    });
  }

  openRazorpay(paymentDetails: any, policyId: number): void {
    const options = {
      key: paymentDetails.razorpayKeyId,
      amount: paymentDetails.amount * 100, // Razorpay takes paisa
      currency: 'INR',
      name: 'Smart Sure',
      description: 'Premium Payment - ' + this.policyType?.name,
      order_id: paymentDetails.razorpayOrderId,
      handler: (response: any) => {
        // Step 3: Confirm payment
        this.paymentService.confirmPayment({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature
        }).subscribe({
          next: () => {
            this.processingPayment = false;
            this.notificationService.success('Payment Successful', 'Your policy is active.');
            this.router.navigate(['/policies', policyId]);
          },
          error: () => {
            this.processingPayment = false;
            this.notificationService.error('Confirmation Error', 'Payment was successful but backend confirmation failed.');
            this.router.navigate(['/policies', policyId]);
          }
        });
      },
      prefill: {
        name: this.purchaseForm.value.nomineeName || 'Customer',
        email: 'customer@example.com',
        contact: '9999999999'
      },
      theme: { color: '#0ea5e9' }, // Primary-500 equivalent
      modal: {
        ondismiss: () => {
          // Optional: handle dismissal failure
          this.paymentService.failPayment({ razorpayOrderId: paymentDetails.razorpayOrderId }).subscribe();
          this.processingPayment = false;
          this.notificationService.warning('Payment Cancelled', 'You can pay the premium later from your policy dashboard.');
          this.router.navigate(['/policies', policyId]);
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', (response: any) => {
      this.paymentService.failPayment({ razorpayOrderId: response.error.metadata.order_id }).subscribe();
      this.processingPayment = false;
      this.notificationService.error('Payment Failed', response.error.description);
    });
    rzp.open();
  }
}
