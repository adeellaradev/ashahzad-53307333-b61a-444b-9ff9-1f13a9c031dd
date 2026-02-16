import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3001/api/v1/roles';

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl, { withCredentials: true });
  }
}
