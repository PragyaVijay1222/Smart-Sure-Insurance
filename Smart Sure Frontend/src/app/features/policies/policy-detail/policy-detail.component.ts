import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PolicyService } from '../../../core/services/policy.service';
import { PaymentService } from '../../../core/services/payment.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UserService, PaymentPreference } from '../../../core/services/user.service';
import { PolicyResponse, PremiumResponse, PremiumPaymentRequest, PaymentRequest, PaymentMethodType } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LucideDynamicIcon, LucideArrowLeft, LucideShieldCheck, LucideCalendar, LucideCircleAlert } from '@lucide/angular';

declare var Razorpay: any;

@Component({
  selector: 'app-policy-detail',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, StatusBadgeComponent, LucideDynamicIcon],
  template: `
    <div class="px-4 py-8 max-w-5xl mx-auto animate-fade-in">
      
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <button (click)="goBack()" class="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
          <svg lucideIcon="arrow-left" [size]="24" class="text-surface-600 dark:text-surface-300"></svg>
        </button>
        <div>
          <h1 class="text-3xl font-bold font-display text-surface-900 dark:text-white">Policy Details</h1>
          <p class="text-surface-500 dark:text-surface-400">Manage your coverage and premiums</p>
        </div>
      </div>

      @if (loading) {
        <app-loading-spinner />
      } @else if (policy) {
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Key Details Sidebar -->
          <div class="lg:col-span-1 space-y-6">
            <div class="bg-primary-600 dark:bg-gradient-to-br dark:from-primary-900 dark:to-primary-950 rounded-2xl p-6 text-white shadow-card">
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-2 opacity-80">
                  <svg lucideIcon="shield-check" [size]="24" class="text-primary-300"></svg>
                  <span class="font-bold tracking-widest uppercase text-xs text-primary-300">Policy</span>
                </div>
                <app-status-badge [status]="policy.status"></app-status-badge>
              </div>
              
              <h4 class="text-2xl font-bold mb-1">{{ policy.policyType.name }}</h4>
              <p class="text-primary-200 font-mono text-sm mb-6">{{ policy.policyNumber }}</p>
              
              <div class="space-y-4">
                <div class="flex justify-between border-b border-white/10 pb-2">
                  <span class="text-white/80 text-sm">Coverage</span>
                  <span class="font-bold">₹{{ policy.coverageAmount | number }}</span>
                </div>
                <div class="flex justify-between border-b border-white/10 pb-2">
                  <span class="text-white/80 text-sm">Premium</span>
                  <span class="font-bold">₹{{ policy.premiumAmount | number }} / mo</span>
                </div>
                <div class="flex justify-between pb-1">
                  <span class="text-white/80 text-sm">Term</span>
                  <span class="font-bold">{{ policy.policyType.termMonths }} months</span>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-card border border-surface-200 dark:border-surface-700">
               <h3 class="font-bold text-lg mb-4 text-surface-900 dark:text-white flex items-center gap-2">
                 <svg lucideIcon="calendar" [size]="20" class="text-surface-500"></svg> Dates
               </h3>
               <div class="space-y-3 text-sm">
                 <div class="flex justify-between">
                   <span class="text-surface-500">Start Date</span>
                   <span class="font-medium text-surface-900 dark:text-white">{{ policy.startDate | date:'mediumDate' }}</span>
                 </div>
                 <div class="flex justify-between">
                   <span class="text-surface-500">End Date</span>
                   <span class="font-medium text-surface-900 dark:text-white">{{ policy.endDate | date:'mediumDate' }}</span>
                 </div>
               </div>
            </div>
          </div>
          
          <!-- Premium Schedule -->
          <div class="lg:col-span-2">
            <div class="bg-white dark:bg-surface-800 rounded-2xl shadow-card border border-surface-200 dark:border-surface-700 overflow-hidden flex flex-col h-full">
              <div class="p-6 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
                <h3 class="font-bold text-xl text-surface-900 dark:text-white">Premium Schedule</h3>
              </div>
              
              <div class="flex-1 overflow-x-auto p-0">
                <table class="w-full text-left text-sm whitespace-nowrap">
                  <thead class="bg-surface-50 dark:bg-surface-900 text-surface-500">
                    <tr>
                      <th class="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Due Date</th>
                      <th class="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Amount</th>
                      <th class="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Status</th>
                      <th class="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-surface-100 dark:divide-surface-700/50">
                    @for (premium of premiums; track premium.id) {
                      <tr class="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                        <td class="px-6 py-4 font-medium text-surface-900 dark:text-white">{{ premium.dueDate | date:'mediumDate' }}</td>
                        <td class="px-6 py-4 font-medium text-surface-900 dark:text-white">₹{{ premium.amount | number }}</td>
                        <td class="px-6 py-4">
                           <span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
                                 [ngClass]="{
                                   'bg-success-50 text-success-600 border-success-200': premium.status === 'PAID',
                                   'bg-warning-50 text-warning-600 border-warning-200': premium.status === 'PENDING' || premium.status === 'PAYMENT_IN_PROGRESS',
                                   'bg-danger-50 text-danger-600 border-danger-200': premium.status === 'OVERDUE'
                                 }">
                                 {{ premium.status.replace('_', ' ') }}
                           </span>
                        </td>
                        <td class="px-6 py-4 text-right">
                          @if (premium.status === 'PENDING' || premium.status === 'OVERDUE' || premium.status === 'PAYMENT_IN_PROGRESS') {
                            <button (click)="payPremium(premium)" [disabled]="processingPayment" class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50">
                              Pay Now
                            </button>
                          }
                        </td>
                      </tr>
                    }
                    @if (premiums.length === 0) {
                      <tr>
                        <td colspan="4" class="px-6 py-8 text-center text-surface-500">
                          No premium schedule found.
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
        </div>
      } @else {
        <div class="text-center py-12">
          <svg lucideIcon="circle-alert" [size]="48" class="text-surface-400 mx-auto mb-4"></svg>
          <h2 class="text-xl font-bold text-surface-900 dark:text-white">Policy Not Found</h2>
          <p class="text-surface-500">The policy you're looking for doesn't exist or you don't have access.</p>
        </div>
      }
    </div>
  `
})
export class PolicyDetailComponent implements OnInit {
  policy: PolicyResponse | null = null;
  premiums: PremiumResponse[] = [];
  loading = true;
  processingPayment = false;

  readonly ArrowLeft = LucideArrowLeft;
  readonly ShieldCheck = LucideShieldCheck;
  readonly Calendar = LucideCalendar;
  readonly CircleAlert = LucideCircleAlert;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private policyService: PolicyService,
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPolicy();
    this.loadRazorpayScript();
  }

  loadPolicy(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.policyService.getPolicyById(+id).subscribe({
        next: (res) => {
          this.policy = res;
          // Premiums might be included in PolicyResponse. If not, fetch separately.
          if (res.premiums && res.premiums.length > 0) {
             this.premiums = res.premiums;
          } else {
             this.fetchPremiums(+id);
          }
          this.loading = false;
        },
        error: () => this.loading = false
      });
    } else {
      this.loading = false;
    }
  }

  fetchPremiums(policyId: number): void {
     this.policyService.getPremiums(policyId).subscribe({
         next: (res) => this.premiums = res,
         error: () => this.notificationService.error('Error', 'Failed to load premium schedule')
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

  payPremium(premium: PremiumResponse): void {
    if (!this.policy) return;

    // Check for saved payment preference
    const userId = this.authService.getUserId();
    const pref: PaymentPreference = userId ? this.userService.getPaymentPreference(userId) : { method: '' };
    if (pref.method) {
      const label = this.getPreferenceLabel(pref);
      const useIt = confirm(`Use your saved payment method?\n\n${label}\n\nClick OK to proceed, or Cancel to use default.`);
      this.initiatePaymentWithMethod(premium, useIt ? pref.method as PaymentMethodType : 'CREDIT_CARD');
    } else {
      this.initiatePaymentWithMethod(premium, 'CREDIT_CARD');
    }
  }

  private getPreferenceLabel(pref: PaymentPreference): string {
    const methodNames: Record<string, string> = {
      'UPI': 'UPI', 'CREDIT_CARD': 'Credit Card', 'DEBIT_CARD': 'Debit Card',
      'NET_BANKING': 'Net Banking', 'WALLET': 'Wallet'
    };
    let label = methodNames[pref.method] || pref.method;
    if (pref.upiId) label += ' — ' + pref.upiId;
    if (pref.cardLabel) label += ' — ' + pref.cardLabel;
    if (pref.bankName) label += ' — ' + pref.bankName;
    if (pref.walletName) label += ' — ' + pref.walletName;
    return label;
  }

  private initiatePaymentWithMethod(premium: PremiumResponse, method: PaymentMethodType): void {
    if (!this.policy) return;
    this.processingPayment = true;

    const premiumPaymentRequest: PremiumPaymentRequest = {
      policyId: this.policy.id,
      premiumId: premium.id,
      paymentMethod: method
    };

    this.policyService.payPremium(premiumPaymentRequest).subscribe({
      next: (premiumRes) => {
        if (premiumRes.razorpayOrderId) {
          this.openRazorpay(premiumRes, premium);
        } else {
          this.processingPayment = false;
          this.notificationService.info('Notice', 'Payment initiated but no gateway order generated.');
        }
      },
      error: (err) => {
        this.processingPayment = false;
        this.notificationService.error('Payment Error', 'Failed to initiate premium payment SAGA.');
      }
    });
  }

  openRazorpay(paymentDetails: any, premium: PremiumResponse): void {
    const options = {
      key: paymentDetails.razorpayKeyId,
      amount: paymentDetails.amount * 100, // Razorpay takes paisa
      currency: 'INR',
      name: 'Smart Sure',
      description: 'Premium Payment - ' + this.policy?.policyType.name,
      order_id: paymentDetails.razorpayOrderId,
      handler: (response: any) => {
        // Step 2: Confirm payment
        this.paymentService.confirmPayment({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature
        }).subscribe({
          next: () => {
            this.processingPayment = false;
            this.notificationService.success('Payment Successful', 'Your premium has been paid.');
            this.loadPolicy(); // Refresh data to show PAID status
          },
          error: () => {
            this.processingPayment = false;
            this.notificationService.error('Confirmation Error', 'Payment was successful but backend confirmation failed.');
            this.loadPolicy(); // Still refresh to catch any backend async updates
          }
        });
      },
      prefill: {
        name: 'Customer',
        email: 'customer@example.com',
        contact: '9999999999'
      },
      theme: { color: '#0ea5e9' },
      modal: {
        ondismiss: () => {
          this.paymentService.failPayment({ razorpayOrderId: paymentDetails.razorpayOrderId }).subscribe();
          this.processingPayment = false;
          this.notificationService.warning('Payment Cancelled', 'You can pay the premium later.');
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
