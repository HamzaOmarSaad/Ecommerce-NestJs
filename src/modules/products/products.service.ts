import { IProduct } from './../../common/interfaces/product.interface';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import {
  UpdateProductDto,
  UpdateProductPramsDto,
} from './dto/update-product.dto';
import { s3Service } from 'src/common/utils/s3.service';
import { BrandRepo, CategoryRepo, ProductRepo } from 'src/common/repos';
import { HUser } from 'src/common/interfaces/user.interface';
import { IFile } from 'src/common/interfaces/multer.interface';
import { toObjectId } from 'src/common/utils/mongoose.utils';
import { randomUUID } from 'crypto';
import { generateSlug } from 'src/common/utils/slug';

@Injectable()
export class ProductsService {
  constructor(
    private readonly s3: s3Service,
    private readonly categoryRepository: CategoryRepo,
    private readonly brandRepository: BrandRepo,
    private readonly productRepository: ProductRepo,
  ) {}

  async create(
    {
      name,
      description,
      price,
      salePrice,
      discount = 0,
      stock,
      brandId,
      categoryId,
    }: CreateProductDto,
    user: HUser,
    {
      productImage,
      gallery,
    }: { productImage: IFile; gallery?: IFile[] | undefined },
  ): Promise<IProduct> {
    brandId = toObjectId(brandId as unknown as string);
    categoryId = toObjectId(categoryId as unknown as string);
    const checkBrand = await this.categoryRepository.findOne({
      filter: { _id: brandId },
    });
    if (!checkBrand) throw new NotFoundException(' brand dont  exist ');

    const checkCategory = await this.categoryRepository.findOne({
      filter: { _id: categoryId },
    });
    if (!checkCategory) throw new NotFoundException(' category dont  exist ');

    const finalPrice = Number(
      (salePrice - salePrice * (discount / 100)).toFixed(2),
    );
    const productId: string = randomUUID().slice(0, 6);
    const image = await this.s3.uploadAsset({
      file: productImage,
      path: `Product/${productId}`,
    });
    let productGallery!: string[];
    if (gallery?.length) {
      productGallery = await this.s3.uploadAssets({
        files: gallery,
        path: `Product/${productId}/gallery`,
      });
    }
    const product = await this.productRepository.create({
      name,
      description,
      price,
      salePrice,
      discount,
      stock,
      brandId,
      categoryId,
      image,
      gallery: productGallery,
      productId,
      finalPrice,
      createdBy: user._id,
    });
    if (!product) {
      await this.s3.deleteFolderContent({
        folderKey: `Product/${productId}`,
      });
      throw new BadRequestException('failed to create this product');
    }
    return product.toJSON();
  }

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }
  private async deleteAttachments(
    gallery: string[] = [],
    image: string | undefined,
  ) {
    const keys: string[] = [];
    if (image) keys.push(image);
    if (gallery) {
      keys.push(...gallery.map((ele) => ele));
    }
    await this.s3.deleteAssets({ keysToDelete: keys });
  }
  async update(
    { productId }: UpdateProductPramsDto,
    {
      name,
      description,
      price,
      salePrice,
      discount = 0,
      stock,
      brandId,
      categoryId,
      removeFromGallery,
    }: UpdateProductDto,
    user: HUser,
    { productImage, gallery }: { productImage?: IFile; gallery?: IFile[] },
  ) {
    brandId = toObjectId(brandId as unknown as string);
    categoryId = toObjectId(categoryId as unknown as string);

    const productExist = await this.productRepository.findById(productId);
    if (!productExist) throw new NotFoundException('product dont exist ');

    if (brandId) {
      const checkBrand = await this.categoryRepository.findOne({
        filter: { _id: brandId },
      });
      if (!checkBrand) throw new NotFoundException(' brand dont  exist ');
    }
    if (categoryId) {
      const checkCategory = await this.categoryRepository.findOne({
        filter: { _id: categoryId },
      });
      if (!checkCategory) throw new NotFoundException(' category dont  exist ');
    }
    let finalPrice = productExist.finalPrice;
    if (price || discount || salePrice) {
      price ??= productExist.price;
      discount ??= productExist.discount as number;
      salePrice ??= productExist.salePrice;
      if (salePrice && salePrice < price) {
        throw new ConflictException(
          'sale price cannot be lower than original price ',
        );
      }
      if (salePrice)
        finalPrice = Number(
          (salePrice - salePrice * (discount / 100)).toFixed(2),
        );
    }

    let uploadedImage: string | undefined;

    if (productImage) {
      uploadedImage = await this.s3.uploadAsset({
        file: productImage,
        path: `Product/${productExist.productId}/gallery`,
      });
    }
    let uploadedGallery: string[] = [];
    if (gallery?.length) {
      uploadedGallery = await this.s3.uploadAssets({
        files: gallery,
        path: `Product/${productExist.productId}/gallery`,
      });
    }

    try {
      const updatedProduct = await this.productRepository.findOneAndUpdate(
        {
          _id: productExist._id,
        },
        [
          {
            $set: {
              ...(name ? { name, slug: generateSlug(name) } : {}),
              ...(description ? { description } : {}),
              price,
              salePrice,
              discount,
              ...(stock ? { stock } : {}),
              ...(brandId ? { brandId } : {}),
              ...(categoryId ? { categoryId } : {}),

              finalPrice,
              Image,
              gallery: {
                $setUnion: [
                  { $setDifference: ['$gallery ', removeFromGallery] },
                  gallery,
                ],
              },
              updatedBy: user._id,
            },
          },
        ],
      );

      if (!updatedProduct) {
        throw new NotFoundException('product not updated');
      }

      await this.deleteAttachments(
        removeFromGallery,
        productImage ? productExist.image : undefined,
      );

      return updatedProduct.toJSON();
    } catch (error) {
      await this.deleteAttachments(
        uploadedGallery,
        productImage ? uploadedImage : undefined,
      );
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
