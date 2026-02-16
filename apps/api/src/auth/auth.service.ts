import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '@ashahzad-task-manager/data';
import { LoginDto, RegisterDto } from './dto';

export interface JwtPayload {
  sub: string;
  email: string;
  roleId: string;
  organizationId: string;
}

export interface AuthResponse {
  user: any;
  accessToken?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    // Load full user with relations
    const fullUser = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['role', 'role.permissions', 'organization'],
    });

    return this.generateAuthResponse(fullUser!);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['role', 'role.permissions', 'organization'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    return this.generateAuthResponse(user);
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'role.permissions', 'organization'],
    });
  }

  generateAuthResponse(user: User): AuthResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      organizationId: user.organizationId,
    };

    const accessToken = this.jwtService.sign(payload);

    // Return full user object with role and organization
    const { password, refreshTokenHash, ...userWithoutSensitiveData } = user as any;

    return {
      user: userWithoutSensitiveData,
      accessToken,
    };
  }
}
