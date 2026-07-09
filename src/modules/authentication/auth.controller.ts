import { authService } from './auth.service';
import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { loginDTO, signupDTO, signupWithGmailDTO } from './dto/auth.dto';
import type { Request, Response } from 'express';
import { LoginResponse } from './entities/auth.entities';

@Controller('/auth')
export class authController {
  constructor(private readonly authService: authService) {}

  @Post('/signup')
  signup(
    @Body()
    body: signupDTO,
  ) {
    return this.authService.Signup(body);
  }
  @Post('/login')
  async login(
    @Body()
    body: loginDTO,
    @Req() req: Request,
  ): Promise<LoginResponse> {
    return await this.authService.login(body, `${req.protocol}://${req.host}`);
  }
  @Post('/signup/google')
  async signupWithGoogle(
    @Body()
    body: signupWithGmailDTO,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    const { status, credentials } = await this.authService.signupWithGoogle(
      body.idToken,
      `${req.protocol}://${req.host}`,
    );
    res.status(status);
    return credentials;
  }
}

//
//@Controller('/auth')
// export class authController {
//   constructor(private readonly authService: authService) {}
//   @Get('/')
//   hello(
//     @Req() req: Request,
//     @Body(
//       'age',
//       new ParseIntPipe({
//         errorHttpStatusCode: 401,
//         exceptionFactory() {
//           throw new HttpException('bad request', 400);
//         },
//         optional: true,
//       }),
//     )
//     age: number,
//   ) {
//     console.log('🚀  ~ hello ~ req:', req, age);
//     return 'hello';
//   }
//   // validation pipe
//   @UsePipes(
//     new ValidationPipe({
//       stopAtFirstError: true,
//       whitelist: true,
//       forbidNonWhitelisted: true,
//     }),
//   )
//   @Get('/welcome')
//   signup(
//     @Body()
//     body: signupDTO,
//     @Query()
//     query: signupDTO,
//   ) {
//     console.log(query);

//     return this.authService.Signup(body);
//   }

//   // custom validation with zod
//   @Post('/wel')
//   login(
//     @Body(new CustomValidationPipe<loginDTO>(loginSchema.body)) body: loginDTO,
//   ) {
//     return this.authService.login(body);
//   }
// }
