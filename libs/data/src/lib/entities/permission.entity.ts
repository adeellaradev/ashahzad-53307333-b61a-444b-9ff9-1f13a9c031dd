import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  Index,
  Unique,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('permissions')
@Unique(['resource', 'action'])
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @Index()
  resource!: string;

  @Column()
  @Index()
  action!: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles!: Role[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
