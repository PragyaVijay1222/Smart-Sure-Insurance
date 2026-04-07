import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" (click)="onCancel()"></div>
        <div class="relative bg-white dark:bg-surface-800 rounded-2xl shadow-elevated max-w-md w-full p-6 animate-scale-in">
          <div class="text-center">
            <div class="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
              [ngClass]="{
                'bg-danger-100 dark:bg-danger-900/30': type === 'danger',
                'bg-warning-100 dark:bg-warning-600/20': type === 'warning',
                'bg-primary-100 dark:bg-primary-900/30': type === 'info'
              }"
            >
              <span class="text-3xl">
                @switch (type) {
                  @case ('danger') { 🗑️ }
                  @case ('warning') { ⚠️ }
                  @default { ❓ }
                }
              </span>
            </div>
            <h3 class="text-lg font-bold text-surface-900 dark:text-white">{{ title }}</h3>
            <p class="mt-2 text-sm text-surface-500 dark:text-surface-400">{{ message }}</p>
          </div>
          <div class="flex gap-3 mt-6">
            <button
              (click)="onCancel()"
              class="flex-1 px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              (click)="onConfirm()"
              class="flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors"
              [ngClass]="{
                'bg-danger-500 hover:bg-danger-600 text-white': type === 'danger',
                'bg-warning-500 hover:bg-warning-600 text-white': type === 'warning',
                'bg-primary-500 hover:bg-primary-600 text-white': type === 'info'
              }"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Are you sure?';
  @Input() message = 'This action cannot be undone.';
  @Input() confirmText = 'Confirm';
  @Input() type: 'danger' | 'warning' | 'info' = 'danger';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
