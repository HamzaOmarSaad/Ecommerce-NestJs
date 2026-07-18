/* eslint-disable @typescript-eslint/no-unsafe-call */

import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'checkGte', async: false })
export class checkGte implements ValidatorConstraintInterface {
  validate(value: number, args: ValidationArguments) {
    return !(value < args.object[args.constraints[0]]);
  }
  defaultMessage(args?: ValidationArguments) {
    return `cannot accept   ${args?.constraints[0]} to be less than  ${args?.property}  `;
  }
}

export function IsGte(property: string[], options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'match',
      target: object.constructor,
      propertyName,
      constraints: property,
      options,
      validator: checkGte,
    });
  };
}
