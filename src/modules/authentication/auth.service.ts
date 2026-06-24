import { Injectable, Body } from '@nestjs/common';
import { signupDTO } from './dto/auth.dto';

@Injectable()
export class authService {
  signup(body: signupDTO): string {
    return `Hello signup!${body.userName}`;
  }
  login({ email, password }): string {
    console.log('🚀 ~ authService ~ login ~ email:', email, password);
    return 'Hello login!';
  }
}
