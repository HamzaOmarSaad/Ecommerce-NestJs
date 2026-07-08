import { NextFunction, Request, Response } from 'express';

export const defaultLang = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const lang = req.headers['accept-language'] || 'en';
  req.headers['accept-language'] = lang;

  next();
};
