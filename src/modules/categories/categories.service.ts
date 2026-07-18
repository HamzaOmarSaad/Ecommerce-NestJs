import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  UpdateCategoryDto,
  UpdateCategoryPramsDto,
} from './dto/update-category.dto';
import { s3Service } from 'src/common/utils/s3.service';
import { BrandRepo, CategoryRepo } from 'src/common/repos';
import { HUser } from 'src/common/interfaces/user.interface';
import { IFile } from 'src/common/interfaces/multer.interface';
import { ICategory } from 'src/common/interfaces/category.interface';
import { toObjectId } from 'src/common/utils/mongoose.utils';
import { generateSlug } from 'src/common/utils/slug';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly s3: s3Service,
    private readonly categoryRepository: CategoryRepo,
    private readonly brandRepository: BrandRepo,
  ) {}
  async create(
    user: HUser,
    { name, brandIds }: CreateCategoryDto,
    CategoryImage: IFile,
  ) {
    brandIds = brandIds?.map((ele) => toObjectId(ele));

    const checkDuplicate = await this.categoryRepository.findOne({
      filter: { name, paranoid: false },
    });
    if (checkDuplicate) {
      throw new ConflictException('duplicated category already exist ');
    }

    if (brandIds?.length) {
      // brand ids count must be less than or equal no of brand in the DB
      if (
        brandIds?.length !=
        (
          await this.brandRepository.find({
            filter: { _Id: { $in: brandIds } },
          })
        ).length
      ) {
        throw new NotFoundException(`missing some or all mentioned brands`);
      }
      //checking existence of each brand
      for (const brandId of brandIds) {
        const brand = await this.brandRepository.findById(brandId);

        if (!brand) {
          throw new NotFoundException(`Brand  not found`);
        }
      }
    }

    const image = await this.s3.uploadAsset({
      file: CategoryImage,
      path: 'Categories',
    });
    const category = await this.categoryRepository.create({
      name,
      image,
      createdBy: user._id,
      brandIds,
    });
    if (!category) {
      await this.s3.deleteAsset({ Key: image });
      throw new BadRequestException('cannot create this category ');
    }
    return category.toJSON();
  }
  async update(
    { categoryId }: UpdateCategoryPramsDto,
    { name, addedBrandIds = [], removedBrandIds = [] }: UpdateCategoryDto,
    user: HUser,
    categoryImage?: IFile,
  ): Promise<ICategory> {
    const id = toObjectId(categoryId as string);

    const category = await this.categoryRepository.findOne({
      filter: { _id: id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (name) {
      const duplicate = await this.categoryRepository.findOne({
        filter: {
          _id: { $ne: id },
          name,
          paranoid: false,
        },
      });

      if (duplicate) {
        throw new ConflictException('Category name already exists');
      }
    }

    const addedIds = addedBrandIds.map((ele) => toObjectId(ele));
    const removedIds = removedBrandIds.map((ele) => toObjectId(ele));

    if (addedIds.length) {
      const brands = await this.brandRepository.find({
        filter: {
          _id: {
            $in: addedIds,
          },
        },
      });

      if (brands.length !== addedIds.length) {
        throw new NotFoundException('Some brands do not exist');
      }
    }

    let uploadedImage: string | undefined;

    if (categoryImage) {
      uploadedImage = await this.s3.uploadAsset({
        file: categoryImage,
        path: 'Categories',
      });
    }

    try {
      const updatedCategory = await this.categoryRepository.findOneAndUpdate(
        {
          _id: id,
        },
        [
          {
            $set: {
              updatedBy: user,
              ...(name && {
                name,
                slug: generateSlug(name),
              }),
              ...(uploadedImage && {
                image: uploadedImage,
              }),
              brandIds: {
                $setUnion: [
                  {
                    $setDifference: ['$brandIds', removedIds],
                  },
                  addedIds,
                ],
              },
            },
          },
        ],
      );

      if (!updatedCategory) {
        throw new NotFoundException('Category not found');
      }

      if (uploadedImage && category.image) {
        await this.s3.deleteAsset({
          Key: category.image,
        });
      }

      return updatedCategory.toJSON();
    } catch (error) {
      if (uploadedImage) {
        await this.s3.deleteAsset({
          Key: uploadedImage,
        });
      }

      throw error;
    }
  }

  findAll() {
    return `This action returns all categories`;
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
