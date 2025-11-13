import type { Nullable } from '@common/types';

export interface User {
  id: number;
  email: string;
  name: Nullable<string>;
  surname: Nullable<string>;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}
