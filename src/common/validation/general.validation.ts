import z from 'zod';

export const generalValidationFields = {
  email: z.email(),
  phone: z
    .string({ error: 'wrong phone number' })
    .regex(/^(00201|\+201|01)(0|1|2|5)\d{8}$/),
  otp: z.string({ error: 'otp is required  ' }).regex(/^\d{6}$/),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
      { error: 'weak password ' },
    ),
};
