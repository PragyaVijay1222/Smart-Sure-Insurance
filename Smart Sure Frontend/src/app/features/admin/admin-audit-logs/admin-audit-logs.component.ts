import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuditLog } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { LucideDynamicIcon, LucideActivity, LucideUser, LucideClock, LucideDatabase } from '@lucide/angular';

@Component({
  selector: 'app-admin-audit-logs',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 min-h-screen bg-surface-50 dark:bg-surface-950 animate-fade-in text-surface-900 dark:text-surface-50">
      
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold font-display flex items-center gap-3">
            <svg lucideIcon="activity" class="text-accent-500"></svg>
            System Audit Logs
          </h1>
          <p class="text-surface-500 dark:text-surface-400 mt-1">Track and monitor all administrative actions and events</p>
        </div>
      </div>

      <!-- Main Content Table -->
      <div class="glass-card overflow-hidden border-white/5 bg-white/5 shadow-card">
        <div class="p-6 border-b border-white/5">
          <h3 class="font-bold text-lg text-white tracking-tight">Recent Administrative Activity</h3>
        </div>

        @if (loading()) {
          <div class="p-20 flex justify-center">
            <app-loading-spinner />
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="bg-white/5 text-surface-400 uppercase tracking-widest text-[10px] font-bold">
                <tr>
                  <th class="px-6 py-4">Admin</th>
                  <th class="px-6 py-4">Action</th>
                  <th class="px-6 py-4">Target Entity</th>
                  <th class="px-6 py-4">Remarks</th>
                  <th class="px-6 py-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5 text-white">
                @for (log of logs(); track log.id) {
                  <tr class="hover:bg-white/5 transition-colors">
                    <td class="px-6 py-4 flex items-center gap-2">
                       <svg lucideIcon="user" [size]="14" class="text-surface-500"></svg>
                       <span class="font-bold">Admin #{{ log.adminId }}</span>
                    </td>
                    <td class="px-6 py-4">
                      <span class="px-2 py-1 bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-lg text-xs font-bold font-mono tracking-tighter">
                        {{ log.action.replace('_', ' ') }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        <svg lucideIcon="database" [size]="14" class="text-surface-500"></svg>
                        <span class="text-surface-300">{{ log.targetEntity }}</span>
                        <span class="text-[10px] text-surface-600 bg-white/5 px-1.5 py-0.5 rounded">ID: {{ log.targetId }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 max-w-sm truncate text-surface-400 text-xs italic">
                      "{{ log.remarks || 'No additional remarks' }}"
                    </td>
                    <td class="px-6 py-4 text-right text-surface-500 font-mono text-xs">
                      {{ log.performedAt | date:'medium' }}
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="px-6 py-12 text-center text-surface-500">
                      No audit logs found.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
})
export class AdminAuditLogsComponent implements OnInit {
  loading = signal(true);
  logs = signal<AuditLog[]>([]);

  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading.set(true);
    this.adminService.getAllAuditLogs().subscribe({
      next: (data) => {
        this.logs.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.notificationService.error('Fetch Error', 'Failed to load system audit logs');
        this.loading.set(false);
      }
    });
  }
}
