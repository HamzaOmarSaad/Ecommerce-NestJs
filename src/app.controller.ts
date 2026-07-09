import { s3Service } from './common/utils/s3.service';
import { Controller, Get, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { pipeline } from 'node:stream';
import { promisify } from 'node:util';
import type { Request, Response } from 'express';

const s3WriteStream = promisify(pipeline);

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly s3Service: s3Service,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
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
    return (await this.s3Service.createPreSignedFetchLink({
      Key,
      download,
      fileName,
    })) as string;
  }
}
