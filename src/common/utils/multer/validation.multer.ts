import { FileFilterCallback } from "multer";
import { badReqException } from "../res/exceptions/domain.exceptions";
import { Request } from "express";

export const fileTypes = {
  image: ["image/png", "image/jpg", "image/jpeg"],
  video: ["video/mp4", "video/webm"],
};

export const fileFilter = (validation: String[]) => {
  return function (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) {
    if (!validation.includes(file.mimetype)) {
      return cb(new badReqException("invalid format"));
    }
    return cb(null, true);
  };
};
