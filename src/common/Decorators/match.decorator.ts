/* eslint-disable @typescript-eslint/no-unsafe-call */

import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'matchPassword', async: false })
export class matchPassword<T = any> implements ValidatorConstraintInterface {
  validate(value: T, args: ValidationArguments) {
    return value == args.object[args.constraints[0]];
  }
  defaultMessage(args?: ValidationArguments) {
    return `fail to match between  ${args?.constraints[0]} and ${args?.property}  `;
  }
}

export function Match<T = any>(
  property: string[],
  options?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'match',
      target: object.constructor,
      propertyName,
      constraints: property,
      options,
      validator: matchPassword<T>,
    });
  };
}
