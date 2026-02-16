import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  method: string;
  endpoint: string;
  statusCode: number;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3001/api/v1/audit-logs';

  getAuditLogs(userId?: string, resource?: string): Observable<AuditLog[]> {
    let params: any = {};
    if (userId) params.userId = userId;
    if (resource) params.resource = resource;

    return this.http.get<AuditLog[]>(this.apiUrl, {
      params,
      withCredentials: true
    });
  }
}
