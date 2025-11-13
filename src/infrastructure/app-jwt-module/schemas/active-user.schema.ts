import * as Joi from 'joi';

import { ActiveUser, AuthProvider } from '@common/types';

export const ActiveUserSchema = Joi.object<ActiveUser>({
  id: Joi.number().required(),
  email: Joi.string().email().required(),
  provider: Joi.string()
    .valid(...Object.values(AuthProvider))
    .required(),
});
