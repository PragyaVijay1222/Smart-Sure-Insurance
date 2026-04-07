import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LucideDynamicIcon, LucideEye, LucideEyeOff } from '@lucide/angular';

@Component({
  selector: 'app-login',
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

      <h2 class="text-2xl font-bold font-display text-surface-900 dark:text-white mb-2">Welcome back</h2>
      <p class="text-surface-500 dark:text-surface-400 mb-8">Sign in to your SmartSure account</p>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Email Address</label>
          <input
            type="email"
            formControlName="email"
            placeholder="you@example.com"
            class="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            id="login-email"
          />
          @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
            <p class="text-danger-600 dark:text-danger-400 text-xs mt-1.5">Please enter a valid email address</p>
          }
        </div>

        <div>
          <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Password</label>
          <div class="relative">
            <input
              [type]="showPassword ? 'text' : 'password'"
              formControlName="password"
              placeholder="Enter your password"
              class="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              id="login-password"
            />
            <button
              type="button"
              (click)="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
            >
              <svg [lucideIcon]="showPassword ? 'eye-off' : 'eye'" [size]="20"></svg>
            </button>
          </div>
          @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
            <p class="text-danger-600 dark:text-danger-400 text-xs mt-1.5">Password must be at least 8 characters</p>
          }
        </div>

        <button
          type="submit"
          [disabled]="loginForm.invalid || isLoading"
          class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          id="login-submit"
        >
          @if (isLoading) {
            <span class="flex items-center justify-center gap-2">
              <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Signing in...
            </span>
          } @else {
            Sign In
          }
        </button>
      </form>

      <p class="text-center text-sm text-surface-500 dark:text-surface-400 mt-8">
        Don't have an account?
        <a routerLink="/auth/register" class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors">
          Create Account
        </a>
      </p>
    </div>
  `,
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;

  readonly Eye = LucideEye;
  readonly EyeOff = LucideEyeOff;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.authService.storeCredentials(email, password);
        this.notificationService.success('Welcome!', `Logged in as ${response.email}`);

        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
        } else if (response.role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }
}
