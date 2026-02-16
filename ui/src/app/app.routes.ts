import { Route } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { map, catchError, of } from 'rxjs';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If already authenticated, allow
  if (authService.isAuthenticated) {
    return true;
  }

  // Otherwise, check with API
  return authService.getCurrentUser().pipe(
    map(() => true),
    catchError(() => {
      return of(router.createUrlTree(['/login']));
    })
  );
};

export const appRoutes: Route[] = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'audit-logs',
    loadComponent: () => import('./pages/audit-logs.component').then(m => m.AuditLogsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'users',
    loadComponent: () => import('./pages/users.component').then(m => m.UsersComponent),
    canActivate: [authGuard]
  }
];
