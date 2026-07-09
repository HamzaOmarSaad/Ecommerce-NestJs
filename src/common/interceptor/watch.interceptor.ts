import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, tap, timeout } from 'rxjs/operators';

@Injectable()
export class watchInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');

    const now = Date.now();
    return next.handle().pipe(
      timeout(1000),
      catchError((err: Error) => {
        if (err instanceof TimeoutError) {
          console.error('Request timed out');
          return throwError(
            () => new RequestTimeoutException('Request timed out'),
          );
        }
        return throwError(() => err);
      }),
      tap(() => console.log(`After... ${Date.now() - now}ms`)),
    );
  }
}
