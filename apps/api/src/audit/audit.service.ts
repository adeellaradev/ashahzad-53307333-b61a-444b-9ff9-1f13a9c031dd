import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction, HttpMethod } from '@ashahzad-task-manager/data';

export interface CreateAuditLogDto {
  userId?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  method: HttpMethod;
  endpoint: string;
  statusCode: number;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>
  ) {}

  async createLog(dto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(dto);
    return this.auditLogRepository.save(auditLog);
  }

  async findAll(userId?: string, resource?: string): Promise<AuditLog[]> {
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (resource) {
      where.resource = resource;
    }

    return this.auditLogRepository.find({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}
