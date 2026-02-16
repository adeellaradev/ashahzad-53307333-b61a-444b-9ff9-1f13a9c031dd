import { SetMetadata } from '@nestjs/common';

export const ROLE_LEVEL_KEY = 'roleLevel';

export const RequireRoleLevel = (minLevel: number) =>
  SetMetadata(ROLE_LEVEL_KEY, minLevel);
