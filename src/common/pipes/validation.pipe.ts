import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodType } from 'zod';

@Injectable()
export class CustomValidationPipe<T> implements PipeTransform {
  constructor(private schema: ZodType) {}
  transform(value: T, metadata: ArgumentMetadata) {
    console.log('🚀 ~ CustomValidationPipe ~ transform ~ metadata:', metadata);

    const { success, error } = this.schema.safeParse(value);
    if (!success) {
      throw new BadRequestException({
        message: 'validation error',
        cause: {
          issues: error.issues.map((issue) => {
            return { path: issue.path, message: issue.message };
          }),
        },
      });
    }
    return value;
  }
}

/*===================================custom validation ============================================= */
// }export class CustomValidationPipe implements PipeTransform {
//   transform(value: signupDTO, metadata: ArgumentMetadata) {
//     console.log('🚀 ~ CustomValidationPipe ~ transform ~ metadata:', metadata);
//     const [firstName, lastName] = value.username?.split(' ') || [];
//     if (!firstName || !lastName) {
//       throw new BadRequestException('invalid user name ');
//     }
//     value.firstName = firstName;
//     value.lastName = lastName;
//     if (value.password !== value.confirmPassword) {
//       throw new BadRequestException('  password dont match ');
//     }
//     return value;
//   }
// }
