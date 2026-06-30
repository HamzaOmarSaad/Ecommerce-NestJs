import { Injectable, Body, ConflictException } from '@nestjs/common';
import { loginDTO, signupDTO } from './dto/auth.dto';
import { UserRepo } from 'src/common/repos';

@Injectable()
export class authService {
  constructor(private readonly userRepository: UserRepo) {}

  async signup(body: signupDTO): Promise<string> {
    const emailExist = await this.userRepository.findByEmail(body.email);
    if (emailExist) {
      throw new ConflictException('email exist ');
    }
    return `Hello signup!${body.userName}`;
  }
  login({ email, password }: loginDTO): string {
    console.log('🚀 ~ authService ~ login ~ email:', email, password);
    return 'Hello login!';
  }
}
