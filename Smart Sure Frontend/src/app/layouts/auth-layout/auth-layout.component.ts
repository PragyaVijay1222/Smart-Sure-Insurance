import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen flex bg-surface-50 dark:bg-gradient-to-br dark:from-primary-950 dark:via-surface-900 dark:to-primary-900 transition-colors duration-500">
      <!-- Left Branding Panel -->
      <div class="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden bg-primary-600 dark:bg-transparent">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_60%)] dark:bg-[radial-gradient(circle_at_30%_50%,rgba(52,120,255,0.15),transparent_60%)]"></div>
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.1),transparent_50%)]"></div>
        <div class="relative z-10 max-w-lg">
          <div class="flex items-center gap-3 mb-8">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <span class="text-white font-bold text-lg">SS</span>
            </div>
            <span class="text-3xl font-bold font-display text-white">SmartSure</span>
          </div>
          <h1 class="text-4xl font-bold font-display text-white leading-tight mb-4">
            Insurance Made
            <span class="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent"> Intelligent</span>
          </h1>
          <p class="text-lg text-white/80 dark:text-surface-400 leading-relaxed">
            Digitize your insurance lifecycle with our smart platform.
            Purchase policies, file claims, and track everything in one place.
          </p>
          <div class="mt-12 grid grid-cols-3 gap-6">
            <div class="text-center">
              <div class="text-2xl font-bold text-white">50K+</div>
              <div class="text-xs text-white/60 dark:text-surface-500 mt-1">Active Policies</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-white">99.9%</div>
              <div class="text-xs text-white/60 dark:text-surface-500 mt-1">Claim Success</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-white">24/7</div>
              <div class="text-xs text-white/60 dark:text-surface-500 mt-1">Support</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Form Panel -->
      <div class="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div class="w-full max-w-md">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {}
