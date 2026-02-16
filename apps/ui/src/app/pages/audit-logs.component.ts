import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../services/auth.service';
import { AuditService, AuditLog } from '../services/audit.service';
import { Router } from '@angular/router';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div class="flex items-center gap-4">
            <button
              (click)="goBack()"
              class="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              ← Back to Dashboard
            </button>
            <h1 class="text-2xl font-bold text-gray-900">Audit Logs</h1>
          </div>
          @if (user) {
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-600">
                {{ user.firstName }} {{ user.lastName }}
                <span class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {{ user.role.name }}
                </span>
              </span>
              <button
                (click)="logout()"
                class="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          }
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 py-8">
        <div class="bg-white rounded-lg shadow">
          <div class="p-6 border-b">
            <h2 class="text-xl font-semibold">API Access Logs</h2>
            <p class="text-sm text-gray-600 mt-1">View all API access and actions (Admin/Owner only)</p>
          </div>

          @if (loading) {
            <div class="p-6 text-center text-gray-500">Loading audit logs...</div>
          } @else if (error) {
            <div class="p-6 text-center text-red-600">{{ error }}</div>
          } @else if (logs.length === 0) {
            <div class="p-6 text-center text-gray-500">No audit logs found</div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 border-b">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  @for (log of logs; track log.id) {
                    <tr class="hover:bg-gray-50">
                      <td class="px-4 py-3 text-sm text-gray-900">
                        {{ formatDate(log.createdAt) }}
                      </td>
                      <td class="px-4 py-3">
                        <span class="px-2 py-1 text-xs font-medium rounded"
                          [class.bg-blue-100]="log.method === 'GET'"
                          [class.text-blue-800]="log.method === 'GET'"
                          [class.bg-green-100]="log.method === 'POST'"
                          [class.text-green-800]="log.method === 'POST'"
                          [class.bg-yellow-100]="log.method === 'PUT' || log.method === 'PATCH'"
                          [class.text-yellow-800]="log.method === 'PUT' || log.method === 'PATCH'"
                          [class.bg-red-100]="log.method === 'DELETE'"
                          [class.text-red-800]="log.method === 'DELETE'"
                        >
                          {{ log.method }}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-sm text-gray-900 font-mono text-xs">
                        {{ log.endpoint }}
                      </td>
                      <td class="px-4 py-3 text-sm text-gray-600">{{ log.action }}</td>
                      <td class="px-4 py-3 text-sm text-gray-600">{{ log.resource }}</td>
                      <td class="px-4 py-3">
                        <span class="px-2 py-1 text-xs font-medium rounded"
                          [class.bg-green-100]="log.statusCode >= 200 && log.statusCode < 300"
                          [class.text-green-800]="log.statusCode >= 200 && log.statusCode < 300"
                          [class.bg-yellow-100]="log.statusCode >= 300 && log.statusCode < 400"
                          [class.text-yellow-800]="log.statusCode >= 300 && log.statusCode < 400"
                          [class.bg-red-100]="log.statusCode >= 400"
                          [class.text-red-800]="log.statusCode >= 400"
                        >
                          {{ log.statusCode }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </main>
    </div>
  `
})
export class AuditLogsComponent implements OnInit {
  private authService = inject(AuthService);
  private auditService = inject(AuditService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  user: User | null = null;
  logs: AuditLog[] = [];
  loading = true;
  error = '';

  ngOnInit() {
    // Wait for user to be loaded, then load data
    this.authService.currentUser$.pipe(
      filter(user => user !== null),
      take(1)
    ).subscribe(user => {
      this.user = user;
      if (user.role.level < 2) {
        this.error = 'Access denied. Admin or Owner role required.';
        this.loading = false;
        return;
      }
      this.loadAuditLogs();
    });

    // Keep user updated
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      this.cdr.markForCheck();
    });
  }

  loadAuditLogs() {
    this.auditService.getAuditLogs().subscribe({
      next: (logs) => {
        this.logs = logs;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load audit logs';
        this.loading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  logout() {
    this.authService.logout().subscribe();
  }
}
