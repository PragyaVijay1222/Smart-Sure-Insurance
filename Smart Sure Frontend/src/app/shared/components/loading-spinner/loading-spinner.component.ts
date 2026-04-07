import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center" [ngStyle]="{'padding-top': size === 48 ? '3rem' : '0', 'padding-bottom': size === 48 ? '3rem' : '0'}">
      <div class="relative" [ngStyle]="{'width.px': size, 'height.px': size}">
        <div class="rounded-full border-4 border-surface-200 dark:border-surface-700 w-full h-full"></div>
        <div class="absolute top-0 left-0 rounded-full border-4 border-transparent w-full h-full animate-spin"
             [ngClass]="color === 'white' ? 'border-t-white' : 'border-t-primary-500'"></div>
      </div>
    </div>
  `,
})
export class LoadingSpinnerComponent {
  @Input() size: number = 48;
  @Input() color: string = 'primary';
}
