import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import { TaskStatus, TaskPriority } from '../enums';
import { User } from './user.entity';
import { Organization } from './organization.entity';

@Entity('tasks')
@Index(['organizationId', 'status'])
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
  @Index()
  status!: TaskStatus;

  @Column({ nullable: true })
  category?: string;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority!: TaskPriority;

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  dueDate?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedHours?: number;

  @Column({ type: 'jsonb', nullable: true })
  tags?: string[];

  @Column({ type: 'uuid' })
  @Index()
  createdById!: string;

  @ManyToOne(() => User, (user) => user.createdTasks)
  createdBy!: User;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  assignedToId?: string;

  @ManyToOne(() => User, (user) => user.assignedTasks, { nullable: true })
  assignedTo?: User;

  @Column({ type: 'uuid' })
  @Index()
  organizationId!: string;

  @ManyToOne(() => Organization, (org) => org.tasks)
  organization!: Organization;

  @DeleteDateColumn()
  @Index()
  deletedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
