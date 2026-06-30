import {
  storageApproachEnum,
  uploadFileSizeEnum,
} from "./../../Enums/multer.enum";
import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  GetObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  APPLICATION_NAME,
  AWS_ACCESS_KEY_ID,
  AWS_EXPIRES_IN,
  AWS_SECRET_ACCESS_KEY,
  BUCKET_NAME,
  REGION,
} from "../../env/config";
import { randomUUID } from "node:crypto";
import { badReqException } from "../res/exceptions/domain.exceptions";
import { createReadStream } from "node:fs";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { deoptional } from "zod/v3";

export class s3Service {
  private client: S3Client;
  constructor() {
    this.client = new S3Client({
      region: REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  async uploadAsset({
    Bucket = BUCKET_NAME,
    path = "general",
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
      Key: `${APPLICATION_NAME}/${path}/${randomUUID()}__${file.originalname}`,
      ACL,
      Body:
        storageApproach == storageApproachEnum.MEMO
          ? file.buffer
          : createReadStream(file.path),
      ContentType: file.mimetype || ContentType,
    });
    if (!command.input?.Key) {
      throw new badReqException("fail to upload ");
    }
    await this.client.send(command);
    return command.input?.Key;
  }
  async uploadLargeAsset({
    Bucket = BUCKET_NAME,
    path = "general",
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
        Key: `${APPLICATION_NAME}/${path}/${randomUUID()}__${file.originalname}`,
        ACL,
        Body:
          storageApproach == storageApproachEnum.MEMO
            ? file.buffer
            : createReadStream(file.path),
        ContentType: file.mimetype || ContentType,
      },
      partSize: partSize * 1024 * 1024,
    });
    uploadFile.on("httpUploadProgress", (progress) => {
      console.log("🚀 ~ s3Service ~ uploadLargeAsset ~ progress:", progress);
      console.log(
        `file upload is ${
          ((progress.loaded as number) / (progress.total as number)) * 100
        }% `,
      );
    });

    return await uploadFile.done();
  }
  async uploadAssets({
    Bucket = BUCKET_NAME,
    path = "general",
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
    Bucket = BUCKET_NAME,
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
  async deleteAsset({
    Bucket = BUCKET_NAME,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }): Promise<DeleteObjectCommandOutput> {
    const command = new DeleteObjectCommand({ Bucket, Key });
    return await this.client.send(command);
  }
  async createPreSignedUploadLink({
    Bucket = BUCKET_NAME,
    path = "general",
    ContentType,
    originalname,
    expiresIn = AWS_EXPIRES_IN,
  }: {
    Bucket?: string;
    path?: string;
    ContentType: string;
    originalname: string;
    expiresIn?: number;
  }) {
    const command = new PutObjectCommand({
      Bucket,
      Key: `${APPLICATION_NAME}/${path}/${randomUUID()}__${originalname}`,
      ContentType: ContentType,
    });
    const url = await getSignedUrl(this.client, command, { expiresIn });
    return { url, Key: command.input.Key };
  }
  async createPreSignedFetchLink({
    Bucket = BUCKET_NAME,
    Key,
    expiresIn = AWS_EXPIRES_IN,
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
        download === "true"
          ? `attachment; filename="${fileName || Key.split("/").pop()}"`
          : undefined,
    });
    const url = await getSignedUrl(this.client, command, { expiresIn });
    return url;
  }
}

export const s3service = new s3Service();
