import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { UserService, UserData, CreateUserData, UpdateUserData } from '../services/user.service';
import { RoleService, Role } from '../services/role.service';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
              ← Back
            </button>
            <h1 class="text-2xl font-bold text-gray-900">User Management</h1>
          </div>
          @if (currentUser) {
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-600">
                {{ currentUser.firstName }} {{ currentUser.lastName }}
                <span class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {{ currentUser.role.name }}
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
        <!-- Create User Button -->
        @if (canCreate) {
          <div class="mb-4">
            <button
              (click)="showCreateModal = true"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + Create User
            </button>
          </div>
        }

        <!-- Users List -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-6 border-b">
            <h2 class="text-xl font-semibold">Users</h2>
          </div>

          @if (loading) {
            <div class="p-6 text-center text-gray-500">Loading users...</div>
          } @else if (users.length === 0) {
            <div class="p-6 text-center text-gray-500">No users found</div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 border-b">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  @for (user of users; track user.id) {
                    <tr class="hover:bg-gray-50">
                      <td class="px-4 py-3 text-sm">{{ user.firstName }} {{ user.lastName }}</td>
                      <td class="px-4 py-3 text-sm">{{ user.email }}</td>
                      <td class="px-4 py-3">
                        <span class="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                          {{ user.role.name }}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-sm">{{ user.organization.name }}</td>
                      <td class="px-4 py-3">
                        <span class="px-2 py-1 text-xs rounded"
                          [class.bg-green-100]="user.isActive"
                          [class.text-green-800]="user.isActive"
                          [class.bg-gray-100]="!user.isActive"
                          [class.text-gray-800]="!user.isActive"
                        >
                          {{ user.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                      <td class="px-4 py-3">
                        <div class="flex gap-2">
                          @if (canEdit) {
                            <button
                              (click)="editUser(user)"
                              class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Edit
                            </button>
                          }
                          @if (canDelete && user.id !== currentUser?.id) {
                            <button
                              (click)="deleteUser(user.id)"
                              class="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Delete
                            </button>
                          }
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </main>

      <!-- Create User Modal -->
      @if (showCreateModal) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-lg max-w-md w-full p-6">
            <h3 class="text-xl font-bold mb-4">Create New User</h3>
            <form (ngSubmit)="createUser()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  [(ngModel)]="newUser.email"
                  name="email"
                  required
                  class="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  [(ngModel)]="newUser.password"
                  name="password"
                  required
                  class="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">First Name</label>
                <input
                  type="text"
                  [(ngModel)]="newUser.firstName"
                  name="firstName"
                  required
                  class="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  [(ngModel)]="newUser.lastName"
                  name="lastName"
                  required
                  class="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Role</label>
                <select
                  [(ngModel)]="newUser.roleId"
                  name="roleId"
                  required
                  class="w-full px-3 py-2 border rounded"
                >
                  <option value="">Select role...</option>
                  @for (role of roles; track role.id) {
                    <option [value]="role.id">{{ role.name }}</option>
                  }
                </select>
              </div>
              <div class="flex gap-2 justify-end">
                <button
                  type="button"
                  (click)="showCreateModal = false"
                  class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Edit User Modal -->
      @if (showEditModal && editingUser) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-lg max-w-md w-full p-6">
            <h3 class="text-xl font-bold mb-4">Edit User</h3>
            <form (ngSubmit)="updateUser()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  [(ngModel)]="editData.email"
                  name="email"
                  class="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Password (leave blank to keep current)</label>
                <input
                  type="password"
                  [(ngModel)]="editData.password"
                  name="password"
                  class="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">First Name</label>
                <input
                  type="text"
                  [(ngModel)]="editData.firstName"
                  name="firstName"
                  class="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  [(ngModel)]="editData.lastName"
                  name="lastName"
                  class="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    [(ngModel)]="editData.isActive"
                    name="isActive"
                  />
                  <span class="text-sm font-medium">Active</span>
                </label>
              </div>
              <div class="flex gap-2 justify-end">
                <button
                  type="button"
                  (click)="showEditModal = false"
                  class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class UsersComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  currentUser: User | null = null;
  users: UserData[] = [];
  roles: Role[] = [];
  loading = true;

  showCreateModal = false;
  showEditModal = false;
  editingUser: UserData | null = null;

  newUser: CreateUserData = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    roleId: '',
    organizationId: ''
  };

  editData: UpdateUserData = {};

  get canCreate(): boolean {
    return (this.currentUser?.role.level ?? 0) >= 2;
  }

  get canEdit(): boolean {
    return (this.currentUser?.role.level ?? 0) >= 2;
  }

  get canDelete(): boolean {
    return (this.currentUser?.role.level ?? 0) >= 3; // Only Owner
  }

  ngOnInit() {
    // Wait for user to be loaded, then load data
    this.authService.currentUser$.pipe(
      filter(user => user !== null),
      take(1)
    ).subscribe(user => {
      this.currentUser = user;
      this.newUser.organizationId = user.organization.id;
      this.loadUsers();
      this.loadRoles();
    });

    // Keep user updated
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.cdr.markForCheck();
    });
  }

  loadRoles() {
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      }
    });
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  createUser() {
    this.userService.createUser(this.newUser).subscribe({
      next: () => {
        this.showCreateModal = false;
        this.newUser = {
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          roleId: '',
          organizationId: this.currentUser?.organization.id || ''
        };
        this.loadUsers();
      }
    });
  }

  editUser(user: UserData) {
    this.editingUser = user;
    this.editData = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      password: ''
    };
    this.showEditModal = true;
  }

  updateUser() {
    if (!this.editingUser) return;

    const updateData: UpdateUserData = {};
    if (this.editData.email !== this.editingUser.email) updateData.email = this.editData.email;
    if (this.editData.firstName !== this.editingUser.firstName) updateData.firstName = this.editData.firstName;
    if (this.editData.lastName !== this.editingUser.lastName) updateData.lastName = this.editData.lastName;
    if (this.editData.isActive !== this.editingUser.isActive) updateData.isActive = this.editData.isActive;
    if (this.editData.password) updateData.password = this.editData.password;

    this.userService.updateUser(this.editingUser.id, updateData).subscribe({
      next: () => {
        this.showEditModal = false;
        this.editingUser = null;
        this.loadUsers();
      }
    });
  }

  deleteUser(id: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => this.loadUsers()
      });
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  logout() {
    this.authService.logout().subscribe();
  }
}
