import { User } from '@ashahzad-task-manager/data';

declare module 'express' {
  export interface Request {
    user?: User;
  }
}
