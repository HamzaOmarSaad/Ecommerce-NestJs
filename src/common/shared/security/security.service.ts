import { Injectable, Body } from '@nestjs/common';
import { ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32); // 256-bit key
const iv = crypto.randomBytes(16);

@Injectable()
export class securityService {
  constructor(private readonly configService: ConfigService) {}
  /* eslint-disable @typescript-eslint/no-unsafe-call */

  hashService = async (text: string): Promise<string> => {
    try {
      const hashed = await bcrypt.hash(text, 10);
      return String(hashed);
    } catch (err: any) {
      throw new ConflictException('Hashing failed', {
        cause: {
          meg: err.message,
        },
      });
    }
  };

  verifyHashService = async (
    originalText: string,
    hashedText: string,
  ): Promise<boolean> => {
    try {
      const result = await bcrypt.compare(originalText, hashedText);
      return Boolean(result);
    } catch (err: any) {
      throw new ConflictException('verifying Hashing failed', {
        cause: {
          meg: err.message,
        },
      });
    }
  };

  encryptService(text: string) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decryptService(encrypted: string) {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
