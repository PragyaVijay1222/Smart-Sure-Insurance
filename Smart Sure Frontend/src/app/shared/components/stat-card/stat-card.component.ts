import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="relative overflow-hidden rounded-2xl border border-surface-200/60 bg-white p-6 shadow-card hover:shadow-card-hover transition-all duration-300 dark:bg-surface-800 dark:border-surface-700"
    >
      <div class="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-10" [ngClass]="iconBg"></div>
      <div class="flex items-start justify-between">
        <div>
          <p class="text-sm font-medium text-surface-500 dark:text-surface-400">{{ label }}</p>
          <p class="mt-2 text-3xl font-bold font-display text-surface-900 dark:text-white">
            {{ prefix }}{{ value | number }}{{ suffix }}
          </p>
          @if (subtitle) {
            <p class="mt-1 text-xs text-surface-400 dark:text-surface-500">{{ subtitle }}</p>
          }
        </div>
        <div class="rounded-xl p-3" [ngClass]="iconBg">
          <span class="text-2xl">{{ icon }}</span>
        </div>
      </div>
    </div>
  `,
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: number | string = 0;
  @Input() icon = '📊';
  @Input() color: 'primary' | 'accent' | 'warning' | 'danger' = 'primary';
  @Input() prefix = '';
  @Input() suffix = '';
  @Input() subtitle = '';

  get iconBg(): string {
    switch (this.color) {
      case 'primary':
        return 'bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400';
      case 'accent':
        return 'bg-accent-100 text-accent-600 dark:bg-accent-900/50 dark:text-accent-400';
      case 'warning':
        return 'bg-warning-100 text-warning-600 dark:bg-warning-600/20 dark:text-warning-400';
      case 'danger':
        return 'bg-danger-100 text-danger-600 dark:bg-danger-700/30 dark:text-danger-400';
    }
  }
}
