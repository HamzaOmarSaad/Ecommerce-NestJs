import { authService } from './auth.service';
import {
  Body,
  Controller,
  Get,
  HttpException,
  ParseIntPipe,
  Post,
  Req,
} from '@nestjs/common';
import { CustomValidationPipe } from 'src/common/pipes/validation.pipe';
import { loginSchema, signupSchema } from './auth.validation';
import type { loginDTO, signupDTO } from './dto/auth.dto';

@Controller('/auth')
export class authController {
  constructor(private readonly authService: authService) {}
  @Get('/')
  hello(
    @Req() req: Request,
    @Body(
      'age',
      new ParseIntPipe({
        errorHttpStatusCode: 401,
        exceptionFactory() {
          throw new HttpException('bad request', 400);
        },
        optional: true,
      }),
    )
    age: number,
  ) {
    console.log('🚀  ~ hello ~ req:', req, age);
    return 'hello';
  }
  @Post('/signup')
  signup(
    @Body(new CustomValidationPipe<signupDTO>(signupSchema.body))
    body: signupDTO,
  ) {
    return this.authService.signup(body);
  }
  @Post('/login')
  login(
    @Body(new CustomValidationPipe<loginDTO>(loginSchema.body)) body: loginDTO,
  ) {
    return this.authService.login(body);
  }
}
