import { s3Service } from './../../common/utils/s3.service';
import { Injectable } from '@nestjs/common';
import {
  storageApproachEnum,
  uploadFileSizeEnum,
} from 'src/common/Enums/multer.enum';
import { HUser, IUser } from 'src/common/interfaces/db.type';
import { IFile } from 'src/common/interfaces/multer.interface';

@Injectable()
export class UsersService {
  constructor(private readonly s3: s3Service) {}

  public async profilePicture(user: HUser, file: IFile): Promise<IUser> {
    const oldImage = user.profilePicture;
    user.profilePicture = await this.s3.uploadAsset({
      file,
      path: `Users/${user.id.toString()}/profile`,
    });
    await user.save();

    if (oldImage) {
      await this.s3.deleteAsset({ Key: oldImage });
    }
    return user.toJSON();
  }

  public async coverPictures(user: HUser, files: IFile[]) {
    const urls = await this.s3.uploadAssets({
      files,
      path: `Users/${user.id.toString()}/cover`,
      storageApproach: storageApproachEnum.DESK,
      uploadApproach: uploadFileSizeEnum.LARGE,
    });
    user.profileCoverPicture = urls;
    await user.save();
    return user.toJSON();
  }
}
