import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CouponTypeEnum } from '../../Enums/coupon.enum';
/**-------------------------------------------------------------------------------------------------------------- */
@ValidatorConstraint({ name: 'DateRange', async: false })
export class DateRange implements ValidatorConstraintInterface {
  validate(value: Date, args: ValidationArguments) {
    return (
      new Date(value).getTime() >
      new Date(args.object[args.constraints[0]] as Date).getTime()
    );
  }
  defaultMessage(args?: ValidationArguments) {
    return `${args?.property}  is not valid ,startDate: ${args?.property} must be after start date: ${args?.constraints[0]}   `;
  }
}

export function IsDateInRange(property: string[], options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'match',
      target: object.constructor,
      propertyName,
      constraints: property,
      options,
      validator: DateRange,
    });
  };
}
/**-------------------------------------------------------------------------------------------------------------- */

@ValidatorConstraint({ name: 'DateInFuture', async: false })
export class DateInFuture implements ValidatorConstraintInterface {
  validate(value: Date, args: ValidationArguments) {
    return new Date(value).getTime() > Date.now();
  }
  defaultMessage(args?: ValidationArguments) {
    return `${args?.property} is not valid ,  date must be in the future  `;
  }
}

export function IsDateFuture(
  property: string[] = [],
  options?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'match',
      target: object.constructor,
      propertyName,
      constraints: property,
      options,
      validator: DateInFuture,
    });
  };
}
/**-------------------------------------------------------------------------------------------------------------- */

@ValidatorConstraint({ name: 'validDiscount', async: false })
export class validDiscount implements ValidatorConstraintInterface {
  validate(value: number, args: ValidationArguments) {
    if (
      (args.object['type'] as CouponTypeEnum) == CouponTypeEnum.PERCENTAGE &&
      value > 100
    ) {
      return false;
    }
    return true;
  }
  defaultMessage(args?: ValidationArguments) {
    return `${args?.property} is not valid , discount cannot exceed 100  `;
  }
}

export function ISvalidDiscount(
  property: string[] = [],
  options?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'match',
      target: object.constructor,
      propertyName,
      constraints: property,
      options,
      validator: validDiscount,
    });
  };
}
/**-------------------------------------------------------------------------------------------------------------- */
