import 'express';

import type { ActiveUser } from '@common/types';

declare module 'express-serve-static-core' {
  interface Request {
    user?: ActiveUser;
  }
}
