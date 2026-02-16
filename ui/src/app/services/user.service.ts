import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  organizationId: string;
  isActive: boolean;
  role: {
    id: string;
    name: string;
    level: number;
  };
  organization: {
    id: string;
    name: string;
  };
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: string;
  organizationId: string;
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  roleId?: string;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3001/api/v1/users';

  getUsers(): Observable<UserData[]> {
    return this.http.get<UserData[]>(this.apiUrl, { withCredentials: true });
  }

  getUser(id: string): Observable<UserData> {
    return this.http.get<UserData>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  createUser(user: CreateUserData): Observable<UserData> {
    return this.http.post<UserData>(this.apiUrl, user, { withCredentials: true });
  }

  updateUser(id: string, user: UpdateUserData): Observable<UserData> {
    return this.http.put<UserData>(`${this.apiUrl}/${id}`, user, { withCredentials: true });
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}
