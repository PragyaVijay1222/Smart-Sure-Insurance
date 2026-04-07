import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideDynamicIcon, LucideInbox, LucideFileQuestion, LucideSearch, LucideFileText } from '@lucide/angular';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, LucideDynamicIcon],
  template: `
    <div class="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div class="w-24 h-24 rounded-3xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-6 text-surface-400 dark:text-surface-500">
        <svg [lucideIcon]="icon" [size]="48"></svg>
      </div>
      <h3 class="text-lg font-semibold text-surface-700 dark:text-surface-300">{{ title }}</h3>
      <p class="text-sm text-surface-400 dark:text-surface-500 mt-2 max-w-sm text-center">{{ message }}</p>
      <ng-content></ng-content>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Nothing here yet';
  @Input() message = 'Get started by creating your first item.';

  readonly Inbox = LucideInbox;
  readonly FileQuestion = LucideFileQuestion;
  readonly Search = LucideSearch;
  readonly FileText = LucideFileText;
}
