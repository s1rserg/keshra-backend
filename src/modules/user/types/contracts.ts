import { Media } from '@modules/media';

import type { Nullable } from '@common/types';

export interface User {
  id: number;
  email: string;
  name: Nullable<string>;
  surname: Nullable<string>;
  username: string;
  createdAt: Date;
  updatedAt: Date;
  avatar?: Nullable<Media>;
}

export interface UserWithAvatar extends User {
  avatar: Nullable<Media>;
}
