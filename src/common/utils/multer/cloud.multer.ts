// import { storageApproachEnum } from "./../../Enums/multer.enum";
// import type { Request } from "express";
// import multer from "multer";
// import { randomUUID } from "node:crypto";
// import { tmpdir } from "node:os";
// import { fileFilter } from "./validation.multer";

// export const fileTypes = {
//   image: ["image/png", "image/jpg", "image/jpeg"],
//   video: ["video/mp4", "video/webm"],
// };
// export const cloudFileUpload = ({
//   storageApproach = storageApproachEnum.MEMO,
//   validation = [],
//   maxSize = 2,
// }: {
//   storageApproach?: storageApproachEnum;
//   validation?: String[];
//   maxSize?: number;
// }) => {
//   const storage =
//     storageApproach == storageApproachEnum.MEMO
//       ? multer.memoryStorage()
//       : multer.diskStorage({
//           filename(
//             req: Request,
//             file: Express.Multer.File,
//             callback: (error: Error | null, destination: string) => void,
//           ) {
//             callback(null, `${randomUUID()}__${file.originalname}`);
//           },
//           destination(
//             req: Request,
//             file: Express.Multer.File,
//             callback: (error: Error | null, destination: string) => void,
//           ) {
//             callback(null, tmpdir());
//           },
//         });
//   return multer({
//     fileFilter: fileFilter(validation),
//     storage,
//     limits: { fileSize: maxSize * 1024 * 1024 },
//   });
// };

// // export const uploadFile = async ({
// //   store = StorageEnum.memory,
// //   Bucket = process.env.S3_BUCKET_NAME as string,
// //   path = "general",
// //   ACL = "private" as ObjectCannedACL,
// //   file,
// // }: {
// //   store?: StorageEnum;
// //   Bucket?: string;
// //   path?: string | undefined;
// //   ACL?: ObjectCannedACL;
// //   file: Express.Multer.File;
// // }): Promise<string> => {
// //   const command = new PutObjectCommand({
// //     Bucket,
// //     Key: `${
// //       process.env.APPLICATION_NAME
// //     }/${path}/${Date.now()}__${Math.random()}/${file.originalname}`,
// //     ACL,
// //     Body:
// //       store === StorageEnum.memory ? file.buffer : createReadStream(file.path),
// //     ContentType: file.mimetype,
// //   });

// //   await s3Config().send(command);
// //   if (!command.input?.Key) {
// //     throw new BadRequestException("Fail to upload", { file });
// //   }
// //   return command.input.Key;
// // };
