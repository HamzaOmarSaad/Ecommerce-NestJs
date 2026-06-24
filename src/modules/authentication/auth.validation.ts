import { generalValidationFields } from 'src/common/validation/general.validation';
import * as z from 'zod';

export const loginSchema = {
  body: z.strictObject({
    email: generalValidationFields.email,
    password: generalValidationFields.password,
  }),
};
export const signupSchema = {
  body: loginSchema.body
    .safeExtend({
      userName: z.string().min(3).max(16),
      confirmPassword: z.string().min(8).max(25).optional(),
      phone: generalValidationFields.phone,
    })
    .superRefine((data, ctx) => {
      if (data.password === data?.confirmPassword) {
        ctx.addIssue({
          code: 'custom',
          path: ['confirmPassword'],
          message: 'password dont match ',
        });
      }
      if (data.email.includes('.HamadaOrg')) {
        ctx.addIssue({
          code: 'custom',
          path: ['email'],
          message: 'invalid domain  ',
        });
      }
    }),
};

export const resendEmailSchema = {
  body: z.object({
    email: generalValidationFields.email,
  }),
};
export const confirmEmailSchema = {
  body: z.object({
    email: generalValidationFields.email,
    otp: generalValidationFields.otp,
  }),
};
