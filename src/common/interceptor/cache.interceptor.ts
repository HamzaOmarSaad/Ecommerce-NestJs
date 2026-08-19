import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, of, throwError, TimeoutError } from 'rxjs';
import { catchError, tap, timeout } from 'rxjs/operators';
import { CacheService } from '../shared/redis/caching.service';
import { Reflector } from '@nestjs/core';
import { personalCache, ttl } from '../Decorators';
import { IAuthRequest, IContextType } from '../interfaces/auth.interface';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class customCacheInterceptor implements NestInterceptor {
  constructor(
    private redis: CacheService,
    private readonly reflector: Reflector,
  ) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const TTL =
      this.reflector.getAllAndOverride<number>(ttl, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 10;
    // if a cache belong for a certain user
    const personal =
      this.reflector.getAllAndOverride<boolean>(personalCache, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false;
    let url!: string;
    let userId!: string;
    let req: IAuthRequest;
    switch (context.getType<IContextType>()) {
      case 'http':
        url = context.switchToHttp().getRequest().url;
        req = context.switchToHttp().getRequest();
        userId = req.credentials?.user.id as string;
        break;
      case 'graphql': {
        const ctx = GqlExecutionContext.create(context);
        url = JSON.stringify({
          key: ctx.getInfo().path.key,
          typename: ctx.getInfo().path.typename,
          args: ctx.getArgs(),
        });
        userId = ctx.getContext().req.credentials?.user.id as string;
        break;
      }

      default:
        break;
    }

    const key = this.redis.getCacheKey(url, personal ? userId : undefined);
    const data = await this.redis.getValue(key);
    if (data) {
      return of(data);
    }

    return next.handle().pipe(
      tap((value) => {
        void this.redis.setValue({ key, value, ttl: TTL });
      }),
    );
  }
}
