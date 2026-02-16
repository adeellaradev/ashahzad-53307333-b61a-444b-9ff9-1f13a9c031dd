import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { AuditAction, HttpMethod } from '../enums';
import { User } from './user.entity';

@Entity('audit_logs')
@Index(['userId', 'createdAt'])
@Index(['resource', 'resourceId'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  userId?: string;

  @ManyToOne(() => User, (user) => user.auditLogs, { nullable: true })
  user?: User;

  @Column({ type: 'enum', enum: AuditAction })
  @Index()
  action!: AuditAction;

  @Column()
  @Index()
  resource!: string;

  @Column({ type: 'uuid', nullable: true })
  resourceId?: string;

  @Column({ type: 'enum', enum: HttpMethod })
  method!: HttpMethod;

  @Column()
  endpoint!: string;

  @Column({ type: 'int' })
  statusCode!: number;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  @Index()
  createdAt!: Date;
}
