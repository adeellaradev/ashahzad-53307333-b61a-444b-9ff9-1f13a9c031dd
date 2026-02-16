import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from './role.entity';
import { Organization } from './organization.entity';
import { Task } from './task.entity';
import { AuditLog } from './audit-log.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  @Index()
  email!: string;

  @Column()
  @Exclude()
  password!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ type: 'uuid' })
  @Index()
  roleId!: string;

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  role!: Role;

  @Column({ type: 'uuid' })
  @Index()
  organizationId!: string;

  @ManyToOne(() => Organization, (org) => org.users, { eager: true })
  organization!: Organization;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  lastLoginAt?: Date;

  @Column({ type: 'int', default: 0 })
  failedLoginAttempts!: number;

  @Column({ nullable: true })
  @Exclude()
  refreshTokenHash?: string;

  @OneToMany(() => Task, (task) => task.createdBy)
  createdTasks!: Task[];

  @OneToMany(() => Task, (task) => task.assignedTo)
  assignedTasks!: Task[];

  @OneToMany(() => AuditLog, (log) => log.user)
  auditLogs!: AuditLog[];

  @DeleteDateColumn()
  @Index()
  deletedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
