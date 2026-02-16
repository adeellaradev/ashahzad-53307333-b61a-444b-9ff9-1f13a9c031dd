import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: {
    name: string;
    level: number;
  };
  organization: {
    id: string;
    name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:3001/api/v1';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  login(email: string, password: string): Observable<{ user: User }> {
    return this.http.post<{ user: User }>(`${this.apiUrl}/auth/login`, { email, password }, { withCredentials: true })
      .pipe(tap(res => this.currentUserSubject.next(res.user)));
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .pipe(tap(() => {
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
      }));
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`, { withCredentials: true })
      .pipe(tap(user => this.currentUserSubject.next(user)));
  }

  get user(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }
}
