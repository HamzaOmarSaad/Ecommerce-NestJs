import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { Request } from 'express';
import { existsSync, mkdirSync } from 'fs';
import multer, { diskStorage } from 'multer';
import { tmpdir } from 'os';
import { resolve } from 'path';
import { storageApproachEnum } from 'src/common/Enums/multer.enum';
import { IFile } from 'src/common/interfaces/multer.interface';

export const fileTypesValidation = {
  image: ['image/png', 'image/jpg', 'image/jpeg'],
  video: ['video/mp4', 'video/webm'],
};

export const localMulter = ({
  validation,
  folder = 'public',
  filesize = 2,
}: {
  validation?: string[];
  folder?: string;
  filesize?: number;
}) => {
  return {
    storage: diskStorage({
      destination: (
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, filename: string) => void,
      ) => {
        const fullPath = resolve(`./uploads/${folder}`);
        if (!existsSync(fullPath)) {
          mkdirSync(fullPath, { recursive: true });
        }
        return cb(null, fullPath);
      },
      filename: (
        req: Request,
        file: IFile,
        cb: (error: Error | null, filename: string) => void,
      ) => {
        const uniqueFileName = folder || randomUUID() + '-' + file.originalname;
        file.finalPath = `./uploads/${folder}`;
        return cb(null, uniqueFileName);
      },
    }),
    fileFilter: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, acceptFile: boolean) => void,
    ) => {
      if (!validation?.includes(file.mimetype)) {
        return cb(new BadRequestException('invalid format'), false);
      }

      cb(null, true);
    },
    limits: {
      fileSize: filesize * 1024 * 1024, // 5MB
    },
  };
};

export const cloudMulter = ({
  storageApproach = storageApproachEnum.MEMO,
  validation = [],
  fileSize = 2,
}: {
  storageApproach?: storageApproachEnum;
  validation?: string[];
  fileSize?: number;
}) => {
  return {
    storage:
      storageApproach == storageApproachEnum.MEMO
        ? multer.memoryStorage()
        : multer.diskStorage({
            filename(
              req: Request,
              file: Express.Multer.File,
              callback: (error: Error | null, destination: string) => void,
            ) {
              callback(null, `${randomUUID()}__${file.originalname}`);
            },
            destination(
              req: Request,
              file: Express.Multer.File,
              callback: (error: Error | null, destination: string) => void,
            ) {
              callback(null, tmpdir());
            },
          }),
    fileFilter: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, acceptFile: boolean) => void,
    ) => {
      if (!validation?.includes(file.mimetype)) {
        return cb(new BadRequestException('invalid format'), false);
      }

      cb(null, true);
    },
    limits: {
      fileSize: fileSize * 1024 * 1024, // 5MB
    },
  };
};
