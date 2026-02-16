import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '@ashahzad-task-manager/data';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(currentUser: User): Promise<User[]> {
    // Users can only see users in their own organization
    return this.userRepository.find({
      where: { organizationId: currentUser.organizationId },
      relations: ['role', 'organization'],
    });
  }

  async findOne(id: string, currentUser: User): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role', 'organization'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user can access this user (same organization)
    if (user.organizationId !== currentUser.organizationId) {
      throw new ForbiddenException('Access denied');
    }

    return user;
  }

  async create(createUserDto: CreateUserDto, currentUser: User): Promise<User> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Admin can only create users in their own organization
    if (currentUser.role.level < 3 && createUserDto.organizationId !== currentUser.organizationId) {
      throw new ForbiddenException('Cannot create users in other organizations');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser: User): Promise<User> {
    const user = await this.findOne(id, currentUser);

    // Hash password if provided
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Update email uniqueness check
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const user = await this.findOne(id, currentUser);

    // Cannot delete yourself
    if (user.id === currentUser.id) {
      throw new ForbiddenException('Cannot delete yourself');
    }

    // Only Owner can delete users
    if (currentUser.role.level < 3) {
      throw new ForbiddenException('Only Owner can delete users');
    }

    await this.userRepository.softRemove(user);
  }
}
