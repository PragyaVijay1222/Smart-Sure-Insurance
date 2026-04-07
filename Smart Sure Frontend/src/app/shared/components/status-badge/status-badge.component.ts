import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase"
      [ngClass]="badgeClass"
    >
      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="dotClass"></span>
      {{ label || status }}
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input() status = '';
  @Input() label = '';

  get badgeClass(): string {
    const s = this.status?.toUpperCase();
    switch (s) {
      case 'ACTIVE':
      case 'APPROVED':
      case 'PAID':
      case 'SUCCESS':
        return 'bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300';
      case 'CREATED':
      case 'DRAFT':
      case 'PENDING':
        return 'bg-surface-100 text-surface-600 dark:bg-surface-700/40 dark:text-surface-300';
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
      case 'PAYMENT_IN_PROGRESS':
        return 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300';
      case 'EXPIRED':
      case 'OVERDUE':
      case 'WARNING':
        return 'bg-warning-100 text-warning-600 dark:bg-warning-600/20 dark:text-warning-400';
      case 'CANCELLED':
      case 'DISCONTINUED':
      case 'REJECTED':
      case 'FAILED':
      case 'CLOSED':
        return 'bg-danger-100 text-danger-700 dark:bg-danger-700/30 dark:text-danger-300';
      default:
        return 'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-300';
    }
  }

  get dotClass(): string {
    const s = this.status?.toUpperCase();
    switch (s) {
      case 'ACTIVE':
      case 'APPROVED':
      case 'PAID':
      case 'SUCCESS':
        return 'bg-accent-500';
      case 'CREATED':
      case 'DRAFT':
      case 'PENDING':
        return 'bg-surface-400';
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
      case 'PAYMENT_IN_PROGRESS':
        return 'bg-primary-500 animate-pulse-soft';
      case 'EXPIRED':
      case 'OVERDUE':
        return 'bg-warning-500';
      case 'CANCELLED':
      case 'DISCONTINUED':
      case 'REJECTED':
      case 'FAILED':
      case 'CLOSED':
        return 'bg-danger-500';
      default:
        return 'bg-surface-400';
    }
  }
}
