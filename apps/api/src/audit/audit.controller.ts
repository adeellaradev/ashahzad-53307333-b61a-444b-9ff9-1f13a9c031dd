import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards';
import { RequireRoleLevel, RoleLevelGuard } from '@ashahzad-task-manager/auth';
import { AuditService } from './audit.service';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RoleLevelGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequireRoleLevel(2)
  @ApiOperation({ summary: 'Get audit logs (Admin+ only)' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'resource', required: false })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(
    @Query('userId') userId?: string,
    @Query('resource') resource?: string
  ) {
    return this.auditService.findAll(userId, resource);
  }
}
