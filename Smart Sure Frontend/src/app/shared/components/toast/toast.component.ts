import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { ToastMessage } from '../../../core/models';
import { LucideDynamicIcon, LucideCircleCheck, LucideCircleX, LucideTriangleAlert, LucideInfo, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, LucideDynamicIcon],
  template: `
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-md">
      @for (toast of (toasts$ | async) ?? []; track toast.id) {
        <div
          class="animate-slide-in-right rounded-xl shadow-elevated px-5 py-4 flex items-start gap-3 backdrop-blur-glass border transition-all duration-300"
          [ngClass]="{
            'bg-accent-50/95 border-accent-200 text-accent-800 dark:bg-accent-900/90 dark:border-accent-700 dark:text-accent-100': toast.type === 'success',
            'bg-danger-50/95 border-danger-200 text-danger-800 dark:bg-danger-700/90 dark:border-danger-600 dark:text-danger-100': toast.type === 'error',
            'bg-warning-50/95 border-warning-400/30 text-warning-600 dark:bg-warning-600/20 dark:border-warning-500/40 dark:text-warning-100': toast.type === 'warning',
            'bg-primary-50/95 border-primary-200 text-primary-800 dark:bg-primary-900/90 dark:border-primary-700 dark:text-primary-100': toast.type === 'info'
          }"
        >
          <div class="mt-0.5">
            @switch (toast.type) {
              @case ('success') { <svg lucideIcon="circle-check" [size]="20"></svg> }
              @case ('error') { <svg lucideIcon="circle-x" [size]="20"></svg> }
              @case ('warning') { <svg lucideIcon="triangle-alert" [size]="20"></svg> }
              @case ('info') { <svg lucideIcon="info" [size]="20"></svg> }
            }
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-sm">{{ toast.title }}</p>
            <p class="text-xs opacity-80 mt-0.5">{{ toast.message }}</p>
          </div>
          <button
            (click)="dismiss(toast.id)"
            class="text-current opacity-50 hover:opacity-100 transition-opacity flex items-center justify-center p-0.5"
          >
            <svg lucideIcon="x" [size]="18"></svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  private notificationService = inject(NotificationService);
  toasts$ = this.notificationService.toasts$;

  readonly CircleCheck = LucideCircleCheck;
  readonly CircleX = LucideCircleX;
  readonly TriangleAlert = LucideTriangleAlert;
  readonly Info = LucideInfo;
  readonly X = LucideX;

  dismiss(id: string): void {
    this.notificationService.dismiss(id);
  }
}
