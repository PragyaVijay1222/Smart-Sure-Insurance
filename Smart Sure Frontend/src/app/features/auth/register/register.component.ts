import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LucideDynamicIcon, LucideUser, LucideShield } from '@lucide/angular';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideDynamicIcon],
  template: `
    <div class="animate-fade-in">
      <div class="lg:hidden flex items-center gap-2 mb-8">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
          <span class="text-white font-bold text-sm">SS</span>
        </div>
        <span class="text-xl font-bold font-display text-surface-900 dark:text-white">SmartSure</span>
      </div>

      <h2 class="text-2xl font-bold font-display text-surface-900 dark:text-white mb-2">Create your account</h2>
      <p class="text-surface-500 dark:text-surface-400 mb-8">Join SmartSure and start your insurance journey</p>

      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">First Name</label>
            <input
              type="text"
              formControlName="firstName"
              placeholder="John"
              class="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              id="register-first-name"
            />
            @if (registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched) {
              <p class="text-danger-600 dark:text-danger-400 text-xs mt-1">First name is required</p>
            }
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Last Name</label>
            <input
              type="text"
              formControlName="lastName"
              placeholder="Doe"
              class="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              id="register-last-name"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Email Address</label>
          <input
            type="email"
            formControlName="email"
            placeholder="you@example.com"
            class="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            id="register-email"
          />
          @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
            <p class="text-danger-600 dark:text-danger-400 text-xs mt-1">Please enter a valid email</p>
          }
        </div>

        <div>
          <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Password</label>
          <input
            type="password"
            formControlName="password"
            placeholder="Min 8 characters"
            class="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            id="register-password"
          />
          @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
            <p class="text-danger-600 dark:text-danger-400 text-xs mt-1">Password must be at least 8 characters</p>
          }
        </div>

        <div>
          <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Account Type</label>
          <div class="grid grid-cols-2 gap-3">
            <label
              class="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all"
              [ngClass]="{
                'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400': registerForm.get('role')?.value === 'CUSTOMER',
                'border-surface-200 dark:border-surface-700 text-surface-500 dark:text-surface-400 hover:border-surface-300 dark:hover:border-surface-600': registerForm.get('role')?.value !== 'CUSTOMER'
              }"
            >
              <input type="radio" formControlName="role" value="CUSTOMER" class="hidden" />
              <svg lucideIcon="user" [size]="20"></svg>
              <span class="text-sm font-medium">Customer</span>
            </label>
            <label
              class="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all"
              [ngClass]="{
                'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400': registerForm.get('role')?.value === 'ADMIN',
                'border-surface-200 dark:border-surface-700 text-surface-500 dark:text-surface-400 hover:border-surface-300 dark:hover:border-surface-600': registerForm.get('role')?.value !== 'ADMIN'
              }"
            >
              <input type="radio" formControlName="role" value="ADMIN" class="hidden" />
              <svg lucideIcon="shield" [size]="20"></svg>
              <span class="text-sm font-medium">Admin</span>
            </label>
          </div>
        </div>

        <!-- Admin ID Code Field — slides in when ADMIN is selected -->
        @if (registerForm.get('role')?.value === 'ADMIN') {
          <div class="overflow-hidden animate-slide-down">
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Admin Verification ID
              <span class="text-surface-400 dark:text-surface-500 font-normal ml-1">(10-digit code)</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg lucideIcon="key-round" [size]="18" class="text-surface-400 dark:text-surface-500"></svg>
              </div>
              <input
                type="text"
                formControlName="adminCode"
                placeholder="Enter your 10-digit Admin ID"
                maxlength="10"
                class="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all tracking-widest font-mono"
                id="register-admin-code"
              />
            </div>
            @if (registerForm.get('adminCode')?.invalid && registerForm.get('adminCode')?.touched) {
              <p class="text-danger-600 dark:text-danger-400 text-xs mt-1">Admin ID must be exactly 10 digits</p>
            }
            <p class="text-surface-400 dark:text-surface-500 text-xs mt-1.5">
              <svg lucideIcon="info" [size]="12" class="inline mr-1 -mt-0.5"></svg>
              Enter the Admin ID provided by your organization
            </p>
          </div>
        }

        <button
          type="submit"
          [disabled]="registerForm.invalid || isLoading"
          class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mt-2"
          id="register-submit"
        >
          @if (isLoading) {
            <span class="flex items-center justify-center gap-2">
              <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Creating account...
            </span>
          } @else {
            Create Account
          }
        </button>
      </form>

      <p class="text-center text-sm text-surface-500 dark:text-surface-400 mt-6">
        Already have an account?
        <a routerLink="/auth/login" class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors">
          Sign In
        </a>
      </p>
    </div>

    <!-- ── Confirmation Modal ── -->
    @if (showConfirmModal) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4" (click)="cancelConfirm()">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"></div>

        <!-- Modal Card -->
        <div
          class="relative w-full max-w-md bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-700 p-6 animate-scale-in"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center">
              <svg lucideIcon="shield-alert" [size]="20" class="text-amber-600 dark:text-amber-400"></svg>
            </div>
            <h3 class="text-lg font-bold font-display text-surface-900 dark:text-white">Confirm Admin ID</h3>
          </div>

          <!-- Body -->
          <p class="text-surface-600 dark:text-surface-300 text-sm mb-3">
            Please verify the Admin Verification ID you entered:
          </p>
          <div class="bg-surface-50 dark:bg-surface-900 rounded-xl px-4 py-3 mb-4 border border-surface-200 dark:border-surface-700">
            <span class="font-mono text-lg tracking-[0.3em] text-surface-900 dark:text-white font-semibold">
              {{ registerForm.get('adminCode')?.value }}
            </span>
          </div>
          <p class="text-surface-500 dark:text-surface-400 text-xs mb-6">
            <svg lucideIcon="triangle-alert" [size]="12" class="inline mr-1 -mt-0.5 text-amber-500"></svg>
            Once submitted, your account will be created with the role determined by this ID. Make sure it is correct.
          </p>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              (click)="cancelConfirm()"
              class="flex-1 py-2.5 px-4 rounded-xl border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 font-medium hover:bg-surface-50 dark:hover:bg-surface-700 transition-all"
              id="confirm-cancel"
            >
              Cancel
            </button>
            <button
              (click)="confirmAndSubmit()"
              class="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold shadow-lg shadow-primary-500/25 transition-all"
              id="confirm-yes"
            >
              Yes, I'm Sure
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .animate-slide-down {
      animation: slideDown 0.3s ease-out forwards;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        max-height: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        max-height: 200px;
        transform: translateY(0);
      }
    }

    .animate-scale-in {
      animation: scaleIn 0.2s ease-out forwards;
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `],
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  showConfirmModal = false;

  readonly User = LucideUser;
  readonly Shield = LucideShield;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['CUSTOMER', Validators.required],
      adminCode: [''],
    });

    // Dynamically add/remove adminCode validation when role changes
    this.registerForm.get('role')?.valueChanges.subscribe((role: string) => {
      const adminCodeCtrl = this.registerForm.get('adminCode');
      if (role === 'ADMIN') {
        adminCodeCtrl?.setValidators([
          Validators.required,
          Validators.pattern(/^\d{10}$/),
        ]);
      } else {
        adminCodeCtrl?.clearValidators();
        adminCodeCtrl?.setValue('');
      }
      adminCodeCtrl?.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    // If admin role → show confirmation modal first
    if (this.registerForm.get('role')?.value === 'ADMIN') {
      this.showConfirmModal = true;
      return;
    }

    // Customer role → submit directly
    this.submitRegistration();
  }

  confirmAndSubmit(): void {
    this.showConfirmModal = false;
    this.submitRegistration();
  }

  cancelConfirm(): void {
    this.showConfirmModal = false;
  }

  private submitRegistration(): void {
    this.isLoading = true;

    const formValue = { ...this.registerForm.value };

    // Only include adminCode if role is ADMIN
    if (formValue.role !== 'ADMIN') {
      delete formValue.adminCode;
    }

    this.authService.register(formValue).subscribe({
      next: (message) => {
        this.isLoading = false;
        this.notificationService.success('Account Created!', message);
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }
}
