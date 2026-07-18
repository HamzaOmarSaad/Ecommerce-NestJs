/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ConfigService } from '@nestjs/config';
import { storageApproachEnum, uploadFileSizeEnum } from '../Enums/multer.enum';
import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  DeleteObjectsCommand,
  DeleteObjectsCommandOutput,
  GetObjectCommand,
  ListObjectsV2Command,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import { randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class s3Service {
  private client: S3Client;
  public APPLICATION_NAME: string;
  public AWS_ACCESS_KEY_ID: string;
  public AWS_EXPIRES_IN: number;
  public AWS_SECRET_ACCESS_KEY: string;
  public BUCKET_NAME: string;
  public REGION: string;

  constructor(private readonly configService: ConfigService) {
    this.APPLICATION_NAME = this.configService.get(
      'APPLICATION_NAME',
    ) as string;
    this.AWS_ACCESS_KEY_ID = this.configService.get(
      'AWS_ACCESS_KEY_ID',
    ) as string;
    this.AWS_EXPIRES_IN = this.configService.get('AWS_EXPIRES_IN') as number;
    this.AWS_SECRET_ACCESS_KEY = this.configService.get(
      'AWS_SECRET_ACCESS_KEY',
    ) as string;
    this.BUCKET_NAME = this.configService.get('BUCKET_NAME') as string;
    this.REGION = this.configService.get('REGION') as string;

    this.client = new S3Client({
      region: this.REGION,
      credentials: {
        accessKeyId: this.AWS_ACCESS_KEY_ID,
        secretAccessKey: this.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  async uploadAsset({
    Bucket = this.BUCKET_NAME,
    path = 'general',
    file,
    ACL = ObjectCannedACL.private,
    ContentType,
    storageApproach = storageApproachEnum.MEMO,
  }: {
    Bucket?: string;
    path?: string;
    file: Express.Multer.File;
    ACL?: ObjectCannedACL;
    ContentType?: string | undefined;
    storageApproach?: storageApproachEnum;
  }) {
    const command = new PutObjectCommand({
      Bucket,
      Key: `${this.APPLICATION_NAME}/${path}/${randomUUID()}__${file.originalname}`,
      ACL,
      Body:
        storageApproach == storageApproachEnum.MEMO
          ? file.buffer
          : createReadStream(file.path),
      ContentType: file.mimetype || ContentType,
    });
    if (!command.input?.Key) {
      throw new BadRequestException('fail to upload ');
    }
    await this.client.send(command);
    return command.input?.Key;
  }
  async uploadLargeAsset({
    Bucket = this.BUCKET_NAME,
    path = 'general',
    file,
    ACL = ObjectCannedACL.private,
    ContentType,
    storageApproach = storageApproachEnum.DESK,
    partSize = 5,
  }: {
    Bucket?: string;
    path?: string;
    file: Express.Multer.File;
    ACL?: ObjectCannedACL;
    ContentType?: string | undefined;
    storageApproach?: storageApproachEnum;
    partSize?: number;
  }) {
    const uploadFile = new Upload({
      client: this.client,
      params: {
        Bucket,
        Key: `${this.APPLICATION_NAME}/${path}/${randomUUID()}__${file.originalname}`,
        ACL,
        Body:
          storageApproach == storageApproachEnum.MEMO
            ? file.buffer
            : createReadStream(file.path),
        ContentType: file.mimetype || ContentType,
      },
      partSize: partSize * 1024 * 1024,
    });
    uploadFile.on('httpUploadProgress', (progress) => {
      console.log('🚀 ~ s3Service ~ uploadLargeAsset ~ progress:', progress);
      console.log(
        `file upload is ${
          ((progress.loaded as number) / (progress.total as number)) * 100
        }% `,
      );
    });

    return await uploadFile.done();
  }
  async uploadAssets({
    path = 'general',
    files,
    ACL = ObjectCannedACL.private,
    ContentType,
    storageApproach = storageApproachEnum.MEMO,
    uploadApproach = uploadFileSizeEnum.SMALL,
  }: {
    Bucket?: string;
    path?: string;
    files: Express.Multer.File[];
    ACL?: ObjectCannedACL;
    ContentType?: string | undefined;
    storageApproach?: storageApproachEnum;
    uploadApproach?: uploadFileSizeEnum;
  }): Promise<string[]> {
    //*/parallel approach
    let urls: string[] = [];
    if (uploadApproach === uploadFileSizeEnum.SMALL) {
      urls = await Promise.all(
        files.map((file) => {
          return this.uploadAsset({
            path,
            file,
            ACL,
            ContentType,
            storageApproach,
          });
        }),
      );
    } else {
      const data = await Promise.all(
        files.map((file) => {
          return this.uploadLargeAsset({
            path,
            file,
            ACL,
            ContentType,
            storageApproach,
          });
        }),
      );
      urls = data.map((ele) => ele.Key as string);
    }

    return urls;
  }
  async getAsset({
    Bucket = this.BUCKET_NAME,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }) {
    const command = new GetObjectCommand({
      Bucket,
      Key,
    });

    return await this.client.send(command);
  }

  async createPreSignedUploadLink({
    Bucket = this.BUCKET_NAME,
    path = 'general',
    ContentType,
    originalname,
    expiresIn = this.AWS_EXPIRES_IN,
  }: {
    Bucket?: string;
    path?: string;
    ContentType: string;
    originalname: string;
    expiresIn?: number;
  }) {
    const command = new PutObjectCommand({
      Bucket,
      Key: `${this.APPLICATION_NAME}/${path}/${randomUUID()}__${originalname}`,
      ContentType: ContentType,
    });
    const url = await getSignedUrl(this.client, command, { expiresIn });
    return { url, Key: command.input.Key };
  }
  async createPreSignedFetchLink({
    Bucket = this.BUCKET_NAME,
    Key,
    expiresIn = this.AWS_EXPIRES_IN,
    fileName,
    download,
  }: {
    Bucket?: string;
    Key: string;
    fileName?: string;
    download?: string;
    expiresIn?: number;
  }) {
    const command = new GetObjectCommand({
      Bucket,
      Key,
      ResponseContentDisposition:
        download === 'true'
          ? `attachment; filename="${fileName || Key.split('/').pop()}"`
          : undefined,
    });
    const url = await getSignedUrl(this.client, command, { expiresIn });
    return url;
  }
  async deleteAsset({
    Bucket = this.BUCKET_NAME,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }): Promise<DeleteObjectCommandOutput> {
    const command = new DeleteObjectCommand({ Bucket, Key });
    return await this.client.send(command);
  }
  async deleteAssets({
    Bucket = process.env.S3_BUCKET_NAME,
    keysToDelete,
    Quiet = false,
  }: {
    Bucket?: string;
    keysToDelete: string[];
    Quiet?: boolean;
  }): Promise<DeleteObjectsCommandOutput> {
    const mappedKeysToDelete: { Key: string }[] = keysToDelete.map((Key) => {
      return { Key };
    });

    const command = new DeleteObjectsCommand({
      Bucket,
      Delete: {
        Objects: mappedKeysToDelete,
        Quiet,
      },
    });
    const result = await this.client.send(command);
    console.log(result);
    return result;
  }
  listFiles = async ({
    Bucket = this.BUCKET_NAME,
    folderKey,
  }: {
    Bucket?: string;
    folderKey: string;
  }) => {
    const command = new ListObjectsV2Command({
      Bucket,
      Prefix: `${process.env.APPLICATION_NAME}/${folderKey}`,
    });

    const objectList = await this.client.send(command);
    console.log({ objectList });
    return objectList;
  };

  deleteFolderContent = async ({
    Bucket = this.BUCKET_NAME,
    Quiet = false,
    folderKey,
  }: {
    Bucket?: string;
    Quiet?: boolean;
    folderKey: string;
  }) => {
    const objects = await this.listFiles({ Bucket, folderKey });
    const keysToDelete: string[] = objects.Contents?.map((obj) => {
      return obj.Key;
    }) as string[];
    console.log({ keysToDelete });
    return await this.deleteAssets({ Bucket, keysToDelete, Quiet });
  };
}
