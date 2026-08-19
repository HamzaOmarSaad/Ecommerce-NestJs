import { s3Service } from './common/utils/s3.service';
import {
  Controller,
  Get,
  Inject,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { pipeline } from 'node:stream';
import { promisify } from 'node:util';
import type { Request, Response } from 'express';
import {
  CACHE_MANAGER,
  CacheInterceptor,
  CacheTTL,
  Cache,
} from '@nestjs/cache-manager';

const s3WriteStream = promisify(pipeline);

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly s3Service: s3Service,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // @CacheTTL(25000)
  // @UseInterceptors(CacheInterceptor)
  @Get()
  async getHello() {
    let data = await this.cacheManager.get('lol');
    if (data) return data;

    data = Date.now();
    await this.cacheManager.set('lol', data, 15000);
    return this.appService.getHello();
    // await this.cacheManager.del{"lol"} deleting the cache
  }
  @Get('/uploads/*path')
  async getFile(@Req() req: Request, @Res() res: Response) {
    const { path } = req.params as { path: string[] };
    const { download, fileName } = req.query as {
      download: string;
      fileName: string;
    };

    const Key = path.join('/');
    const s3Response = await this.s3Service.getAsset({ Key });
    res.setHeader(
      'Content-Type',
      s3Response.ContentType || 'application/octet-stream',
    );
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    if (download === 'true') {
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName || Key.split('/').pop()}"`,
      ); // only apply it for  download
    }
    return await s3WriteStream(s3Response.Body as NodeJS.ReadableStream, res);
  }

  @Get('/presigned/*path')
  async getPresignedFile(@Req() req: Request) {
    const { path } = req.params as { path: string[] };
    const { download, fileName } = req.query as {
      download: string;
      fileName: string;
    };
    const Key = path.join('/');
    return await this.s3Service.createPreSignedFetchLink({
      Key,
      download,
      fileName,
    });
  }
}
