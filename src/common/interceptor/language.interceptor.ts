import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class LanguageInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    switch (context.getType()) {
      case 'http': {
        const request = context.switchToHttp().getRequest();
        request.headers['accept-language'] =
          request.credentials?.user?.language || 'en';
        break;
      }
    }

    return next.handle().pipe();
  }
}
