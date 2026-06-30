import { authService } from './auth.service';
import {
  Body,
  Controller,
  Get,
  HttpException,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { loginDTO, signupDTO } from './dto/auth.dto';
import { CustomValidationPipe } from 'src/common/pipes/validation.pipe';
import { loginSchema } from './auth.validation';

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
  // validation pipe
  @UsePipes(
    new ValidationPipe({
      stopAtFirstError: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @Get('/welcome')
  signup(
    @Body()
    body: signupDTO,
    @Query()
    query: signupDTO,
  ) {
    console.log(query);

    return this.authService.signup(body);
  }

  // custom validation with zod
  @Post('/wel')
  login(
    @Body(new CustomValidationPipe<loginDTO>(loginSchema.body)) body: loginDTO,
  ) {
    return this.authService.login(body);
  }
}
