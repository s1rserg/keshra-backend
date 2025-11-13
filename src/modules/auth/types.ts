import type { AuthProvider } from '@common/types';

export interface IAuthRegisterPayload {
  provider: AuthProvider;
  email: string;
  username: string;
  password?: string;
}
