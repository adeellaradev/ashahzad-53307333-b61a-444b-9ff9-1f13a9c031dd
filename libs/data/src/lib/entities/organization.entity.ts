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
import { User } from './user.entity';
import { Task } from './task.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  @Index()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  parentId?: string;

  @ManyToOne(() => Organization, (org) => org.children, { nullable: true })
  parent?: Organization;

  @OneToMany(() => Organization, (org) => org.parent)
  children!: Organization[];

  @OneToMany(() => User, (user) => user.organization)
  users!: User[];

  @OneToMany(() => Task, (task) => task.organization)
  tasks!: Task[];

  @DeleteDateColumn()
  deletedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
