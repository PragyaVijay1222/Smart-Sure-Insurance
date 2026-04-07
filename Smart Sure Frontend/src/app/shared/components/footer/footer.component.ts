import { Component } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [LucideDynamicIcon],
  template: `
    <footer class="border-t border-surface-200/60 bg-white dark:bg-surface-900 dark:border-surface-700/60">
      <div class="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16 py-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div>
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <span class="text-white font-bold text-xs">SS</span>
              </div>
              <span class="font-bold font-display text-surface-800 dark:text-white">SmartSure</span>
            </div>
            <p class="text-sm text-surface-500 dark:text-surface-400 max-w-xs">
              Digitizing insurance for a smarter, safer tomorrow. Manage policies, claims, and payments with ease.
            </p>
          </div>
          <div>
            <h4 class="font-semibold text-surface-800 dark:text-surface-200 mb-3">Quick Links</h4>
            <ul class="space-y-2 text-sm text-surface-500 dark:text-surface-400">
              <li><a href="/policy-types" class="hover:text-primary-500 transition-colors">Insurance Plans</a></li>
              <li><a href="/policies" class="hover:text-primary-500 transition-colors">My Policies</a></li>
              <li><a href="/claims" class="hover:text-primary-500 transition-colors">File a Claim</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold text-surface-800 dark:text-surface-200 mb-3">Support</h4>
            <ul class="space-y-3 text-sm text-surface-500 dark:text-surface-400">
              <li class="flex items-center gap-2">
                <svg lucideIcon="mail" [size]="16" class="text-primary-500"></svg>
                <span>support&#64;smartsure.com</span>
              </li>
              <li class="flex items-center gap-2">
                <svg lucideIcon="phone" [size]="16" class="text-primary-500"></svg>
                <span>1-800-SMART-SURE</span>
              </li>
              <li class="flex items-center gap-2">
                <svg lucideIcon="clock" [size]="16" class="text-primary-500"></svg>
                <span>Mon-Fri, 9AM - 6PM</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="mt-8 pt-6 border-t border-surface-200 dark:border-surface-700 text-center text-xs text-surface-400 dark:text-surface-500">
          © {{ currentYear }} SmartSure Insurance. All rights reserved.
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
