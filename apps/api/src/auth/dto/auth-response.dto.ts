import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '1ba1fb66-3050-4ee9-97a8-8d5f620022ab' })
  id!: string;

  @ApiProperty({ example: 'admin@example.com' })
  email!: string;

  @ApiProperty({ example: 'Admin' })
  firstName!: string;

  @ApiProperty({ example: 'User' })
  lastName!: string;

  @ApiProperty({ example: 'f2fcceb2-8b90-4290-b41e-9bb575bea3cd' })
  roleId!: string;

  @ApiProperty({ example: '30c9232c-d9b4-461a-8489-bbe41e96469b' })
  organizationId!: string;
}

export class AuthResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto;
}

export class LogoutResponseDto {
  @ApiProperty({ example: 'Logged out successfully' })
  message!: string;
}
