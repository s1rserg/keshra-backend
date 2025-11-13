import { registerDecorator } from 'class-validator';

export function IsUsername() {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidUsername',
      target: object.constructor,
      propertyName,
      options: {
        message: 'username is required and must be between 2 and 20 characters',
      },
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && value.length >= 2 && value.length <= 20;
        },
        defaultMessage() {
          return 'username must be a string between 2 and 20 characters';
        },
      },
    });
  };
}
