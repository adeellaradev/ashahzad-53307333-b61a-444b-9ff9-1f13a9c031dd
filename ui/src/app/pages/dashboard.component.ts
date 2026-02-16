import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { TaskService, Task } from '../services/task.service';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div class="flex items-center gap-4">
            <h1 class="text-2xl font-bold text-gray-900">Task Manager</h1>
            @if (canManageUsers) {
              <a
                [routerLink]="['/users']"
                class="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                Manage Users
              </a>
            }
            @if (canViewAuditLogs) {
              <a
                [routerLink]="['/audit-logs']"
                class="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                View Audit Logs
              </a>
            }
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
        <!-- Create Task Form (Admin/Owner only) -->
        @if (canCreate) {
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">Create New Task</h2>
            <form (ngSubmit)="createTask()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  [(ngModel)]="newTask.title"
                  name="title"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  [(ngModel)]="newTask.priority"
                  name="priority"
                  class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  [(ngModel)]="newTask.description"
                  name="description"
                  rows="2"
                  class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div class="md:col-span-2">
                <button
                  type="submit"
                  class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        }

        <!-- Tasks List -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-6 border-b">
            <h2 class="text-xl font-semibold">Tasks</h2>
          </div>

          @if (loading) {
            <div class="p-6 text-center text-gray-500">Loading tasks...</div>
          } @else if (tasks.length === 0) {
            <div class="p-6 text-center text-gray-500">No tasks found</div>
          } @else {
            <div class="divide-y">
              @for (task of tasks; track task.id) {
                <div class="p-4 hover:bg-gray-50">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <h3 class="font-semibold text-lg">{{ task.title }}</h3>
                      @if (task.description) {
                        <p class="text-gray-600 mt-1">{{ task.description }}</p>
                      }
                      <div class="flex gap-2 mt-2">
                        <span class="px-2 py-1 text-xs rounded"
                          [class.bg-yellow-100]="task.status === 'pending'"
                          [class.text-yellow-800]="task.status === 'pending'"
                          [class.bg-blue-100]="task.status === 'in-progress'"
                          [class.text-blue-800]="task.status === 'in-progress'"
                          [class.bg-green-100]="task.status === 'completed'"
                          [class.text-green-800]="task.status === 'completed'"
                        >
                          {{ task.status }}
                        </span>
                        <span class="px-2 py-1 text-xs rounded"
                          [class.bg-gray-100]="task.priority === 'low'"
                          [class.text-gray-800]="task.priority === 'low'"
                          [class.bg-orange-100]="task.priority === 'medium'"
                          [class.text-orange-800]="task.priority === 'medium'"
                          [class.bg-red-100]="task.priority === 'high'"
                          [class.text-red-800]="task.priority === 'high'"
                        >
                          {{ task.priority }}
                        </span>
                      </div>
                    </div>

                    @if (canEdit) {
                      <div class="flex gap-2 ml-4">
                        <button
                          (click)="updateTaskStatus(task)"
                          class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Next Status
                        </button>
                        @if (canDelete) {
                          <button
                            (click)="deleteTask(task.id)"
                            class="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                        }
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </main>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private taskService = inject(TaskService);
  private cdr = inject(ChangeDetectorRef);

  user: User | null = null;
  tasks: Task[] = [];
  loading = true;

  newTask = {
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  };

  get canCreate(): boolean {
    return (this.user?.role.level ?? 0) >= 2; // Admin or Owner
  }

  get canEdit(): boolean {
    return (this.user?.role.level ?? 0) >= 2; // Admin or Owner
  }

  get canDelete(): boolean {
    return (this.user?.role.level ?? 0) >= 2; // Admin or Owner
  }

  get canViewAuditLogs(): boolean {
    return (this.user?.role.level ?? 0) >= 2; // Admin or Owner
  }

  get canManageUsers(): boolean {
    return (this.user?.role.level ?? 0) >= 2; // Admin or Owner
  }

  ngOnInit() {
    // Wait for user to be loaded, then load tasks
    this.authService.currentUser$.pipe(
      filter(user => user !== null),
      take(1)
    ).subscribe(user => {
      this.user = user;
      this.loadTasks();
    });

    // Keep user updated
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      this.cdr.markForCheck();
    });
  }

  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  createTask() {
    if (!this.newTask.title) return;

    this.taskService.createTask(this.newTask).subscribe({
      next: () => {
        this.newTask = { title: '', description: '', priority: 'medium' };
        this.loadTasks();
      }
    });
  }

  updateTaskStatus(task: Task) {
    const statusOrder: ('pending' | 'in-progress' | 'completed')[] = ['pending', 'in-progress', 'completed'];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

    this.taskService.updateTask(task.id, { status: nextStatus }).subscribe({
      next: () => this.loadTasks()
    });
  }

  deleteTask(id: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id).subscribe({
        next: () => this.loadTasks()
      });
    }
  }

  logout() {
    this.authService.logout().subscribe();
  }
}
