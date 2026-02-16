import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { AuditService } from './audit.service';
import { AuditAction, HttpMethod } from '@ashahzad-task-manager/data';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const method = request.method as HttpMethod;
    const endpoint = request.url;
    const user = request.user;
    const ipAddress = request.ip || request.socket.remoteAddress;
    const userAgent = request.headers['user-agent'];

    return next.handle().pipe(
      tap({
        next: () => {
          const statusCode = response.statusCode;

          if (this.shouldAudit(endpoint, method)) {
            const { resource, resourceId, action } = this.parseEndpoint(
              endpoint,
              method,
              statusCode
            );

            this.auditService
              .createLog({
                userId: user?.id,
                action,
                resource,
                resourceId,
                method,
                endpoint,
                statusCode,
                ipAddress,
                userAgent,
                metadata: {
                  body: this.sanitizeBody(request.body),
                  query: request.query,
                },
              })
              .catch((error) => {
                console.error('Failed to create audit log:', error);
              });
          }
        },
        error: (error) => {
          const statusCode = error.status || 500;

          if (this.shouldAudit(endpoint, method)) {
            const { resource, resourceId, action } = this.parseEndpoint(
              endpoint,
              method,
              statusCode
            );

            this.auditService
              .createLog({
                userId: user?.id,
                action,
                resource,
                resourceId,
                method,
                endpoint,
                statusCode,
                ipAddress,
                userAgent,
                metadata: {
                  error: error.message,
                  body: this.sanitizeBody(request.body),
                  query: request.query,
                },
              })
              .catch((err) => {
                console.error('Failed to create audit log:', err);
              });
          }
        },
      })
    );
  }

  private shouldAudit(endpoint: string, method: string): boolean {
    if (endpoint.includes('/api/v1/docs')) {
      return false;
    }

    if (method === 'GET' && endpoint.includes('/audit-logs')) {
      return false;
    }

    return true;
  }

  private parseEndpoint(
    endpoint: string,
    method: string,
    statusCode: number
  ): { resource: string; resourceId?: string; action: AuditAction } {
    const parts = endpoint.split('/').filter(Boolean);
    const apiIndex = parts.findIndex((p) => p === 'api');
    const resourceParts = parts.slice(apiIndex + 2);

    let resource = resourceParts[0] || 'unknown';
    let resourceId: string | undefined;
    let action: AuditAction;

    if (resourceParts.length > 1 && resourceParts[1].match(/^[a-f0-9-]{36}$/i)) {
      resourceId = resourceParts[1];
    }

    if (method === 'POST' && statusCode >= 200 && statusCode < 300) {
      action = AuditAction.CREATE;
    } else if (method === 'GET') {
      action = AuditAction.READ;
    } else if (
      (method === 'PUT' || method === 'PATCH') &&
      statusCode >= 200 &&
      statusCode < 300
    ) {
      action = AuditAction.UPDATE;
    } else if (method === 'DELETE' && statusCode >= 200 && statusCode < 300) {
      action = AuditAction.DELETE;
    } else {
      action = AuditAction.READ;
    }

    return { resource, resourceId, action };
  }

  private sanitizeBody(body: any): any {
    if (!body) {
      return undefined;
    }

    const sanitized = { ...body };

    if (sanitized.password) {
      sanitized.password = '***REDACTED***';
    }

    return sanitized;
  }
}
