import { loginSchema, signupSchema } from './../auth.validation';
// export class signupDTO {
//   userName!: string;
//   email!: string;
//   password!: string;
//   confirmPassword!: string;
// }
// export class loginDTO {
//   email!: string;
//   password!: string;
// }

import z from 'zod';

export type signupDTO = z.infer<typeof signupSchema.body>;
export type loginDTO = z.infer<typeof loginSchema.body>;
