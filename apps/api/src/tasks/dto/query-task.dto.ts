import { IsOptional, IsEnum, IsUUID, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '@ashahzad-task-manager/data';

export class QueryTaskDto {
  @ApiPropertyOptional({ enum: TaskStatus })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({ example: '1ba1fb66-3050-4ee9-97a8-8d5f620022ab' })
  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @ApiPropertyOptional({ example: '1ba1fb66-3050-4ee9-97a8-8d5f620022ab' })
  @IsUUID()
  @IsOptional()
  createdById?: string;

  @ApiPropertyOptional({ example: 'Development' })
  @IsString()
  @IsOptional()
  category?: string;
}
