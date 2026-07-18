import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IFile } from 'src/common/interfaces/multer.interface';
import { HUser } from 'src/common/interfaces/user.interface';
import { BrandRepo } from 'src/common/repos';
import { s3Service } from 'src/common/utils/s3.service';
import { UpdateBrandDto, UpdateBrandPramsDto } from './dto/update-brand.dto';
import { toObjectId } from 'src/common/utils/mongoose.utils';
import { generateSlug } from 'src/common/utils/slug';
import { IBrand } from 'src/common/interfaces/brand.interface';

@Injectable()
export class BrandService {
  constructor(
    private readonly s3: s3Service,
    private readonly brandRepository: BrandRepo,
  ) {}
  async create(user: HUser, brandName: string, BrandImage: IFile) {
    const checkDuplicate = await this.brandRepository.findOne({
      filter: { name: brandName, paranoid: false },
    });
    if (checkDuplicate) {
      throw new ConflictException('duplicated brand');
    }
    const image = await this.s3.uploadAsset({
      file: BrandImage,
      path: 'Brands',
    });
    const brand = await this.brandRepository.create({
      name: brandName,
      image,
      createdBy: user._id,
    });
    if (!brand) {
      await this.s3.deleteAsset({ Key: image });
      throw new BadRequestException('cannot create this brand ');
    }
    return brand.toJSON();
  }
  async update(
    { brandId }: UpdateBrandPramsDto,
    { name }: UpdateBrandDto,
    user: HUser,
    BrandImage?: IFile,
  ): Promise<IBrand> {
    brandId = toObjectId(brandId as string);
    const brand = await this.brandRepository.findOne({
      filter: { _id: brandId },
    });
    if (!brand) {
      throw new NotFoundException('notfound brand');
    }
    const checkDuplicate = await this.brandRepository.findOne({
      filter: { name, _id: { $ne: brandId }, paranoid: false },
    });

    if (name) {
      if (checkDuplicate) {
        throw new ConflictException('name exist for another brand ');
      }
      brand.name = name;
      brand.slug = generateSlug(name);
    }

    if (BrandImage) {
      const newImage = await this.s3.uploadAsset({
        file: BrandImage,
        path: 'Brands',
      });
      if (brand.image) {
        await this.s3.deleteAsset({ Key: brand.image });
      }
      brand.image = newImage;
    }
    brand.updatedBy = user._id;
    await brand.save();
    return brand.toJSON();
  }

  findAll() {
    return `This action returns all brand`;
  }

  findOne(id: number) {
    return `This action returns a #${id} brand`;
  }

  remove(id: number) {
    return `This action removes a #${id} brand`;
  }
}
