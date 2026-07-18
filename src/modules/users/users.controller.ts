import {
  Controller,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Patch,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { Auth, User } from 'src/common/Decorators';
import { RoleEnum } from 'src/common/Enums/enums';
import type { HUser } from 'src/common/interfaces/user.interface';
import { UsersService } from './users.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  cloudMulter,
  fileTypesValidation,
} from 'src/common/utils/local.multer';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  /**------------------------------user profile-------------------------------------------------------- */

  @Auth([RoleEnum.user])
  @Get()
  profile(@User() user: HUser) {
    return user;
  }
  /**------------------------------profile Picture-------------------------------------------------------- */
  @UseInterceptors(
    FileInterceptor(
      'profilePicture',
      // localMulter({ validation: fileTypesValidation.image, folder: 'User' }),
      cloudMulter({ validation: fileTypesValidation.image }),
    ),
  )
  @Auth([RoleEnum.user])
  @Patch('/profile-picture')
  profilePicture(
    @User() user: HUser,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.usersService.profilePicture(user, file);
  }
  /**------------------------------cover Pictures-------------------------------------------------------- */

  @UseInterceptors(
    FilesInterceptor(
      'coverPictures',
      3,
      // localMulter({ validation: fileTypesValidation.image, folder: 'User' }),
      cloudMulter({ validation: fileTypesValidation.image }),
    ),
  )
  @Auth([RoleEnum.user])
  @Patch('/profile-cover-pictures')
  coverPictures(
    @User() user: HUser,
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 })],
      }),
    )
    files: Express.Multer.File[],
  ) {
    return this.usersService.coverPictures(user, files);
  }
}
