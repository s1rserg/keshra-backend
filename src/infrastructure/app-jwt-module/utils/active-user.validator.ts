import { ActiveUserSchema } from '../schemas/active-user.schema';

export const activeUserValidator = async (value: unknown) => {
  return ActiveUserSchema.validateAsync(value, { stripUnknown: true });
};
