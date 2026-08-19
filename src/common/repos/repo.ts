import {
  HydratedDocument,
  Model,
  ProjectionType,
  QueryOptions,
  Types,
  UpdateQuery,
  DeleteResult,
  UpdateWriteOpResult,
  MongooseUpdateQueryOptions,
  QueryFilter,
  PopulateOptions,
} from 'mongoose';
import { IPaginate } from '../interfaces/paginate.interface';

export type Doc<T> = HydratedDocument<T>;

export class DBRepo<T extends object> {
  constructor(protected readonly model: Model<T>) {}

  // ================= FIND MANY =================
  async find(
    filter: QueryFilter<T> = {},
    projection?: ProjectionType<T>,
    options?: QueryOptions,
  ): Promise<Doc<T>[]> {
    const docs = this.model.find(filter, projection, options);
    if (options?.populate) docs.populate(options.populate as PopulateOptions[]);
    if (options?.skip) docs.skip(options.skip);
    if (options?.limit) docs.limit(options.limit);

    return await docs.exec();
  }
  async PaginatedFind({
    filter = {},
    projection,
    options = {},
    page = 0,
    size = 5,
  }: {
    filter?: QueryFilter<T>;
    projection?: ProjectionType<T>;
    options?: QueryOptions;
    page?: number | string | undefined;
    size?: number | string | undefined;
  }): Promise<IPaginate<T>> {
    let count: number = -1;
    const parsedPage = Number(page) ? parseInt(page as string, 10) : 0;
    const parsedSize = Number(size) ? parseInt(size as string, 10) : 5;

    if (parsedPage > 0) {
      options.skip = (parsedPage - 1) * parsedSize;
      options.limit = parsedSize;
      count = await this.model.countDocuments(filter);
    }
    const docs = await this.model.find(filter, projection, options);
    return {
      docs,
      ...(parsedPage > 0
        ? {
            currentPage: parsedPage,
            size: parsedSize,
            pages: Math.ceil(count / parsedSize),
          }
        : {}),
    };
  }

  // ================= FIND ONE =================
  async findOne(
    filter: QueryFilter<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions,
  ): Promise<Doc<T> | null> {
    return this.model.findOne(filter, projection, options);
  }

  // ================= FIND BY ID =================
  async findById(
    id: string | Types.ObjectId,
    projection?: ProjectionType<T>,
    options?: QueryOptions,
  ): Promise<Doc<T> | null> {
    return this.model.findById(id, projection, options);
  }

  // ================= CREATE ONE / MANY =================

  async create(data: Partial<T>): Promise<Doc<T>> {
    return this.model.create(data);
  }
  async createMany(data: Partial<T>[]): Promise<Doc<T>[]> {
    return this.model.create(data);
  }

  // ================= UPDATE ONE =================
  async updateOne(
    filter: QueryFilter<T>,
    update: UpdateQuery<T>,
    options?: MongooseUpdateQueryOptions,
  ): Promise<UpdateWriteOpResult> {
    return this.model.updateOne(filter, update, options);
  }

  // ================= UPDATE MANY =================
  async updateMany(
    filter: QueryFilter<T>,
    update: UpdateQuery<T>,
    options?: MongooseUpdateQueryOptions,
  ): Promise<UpdateWriteOpResult> {
    return this.model.updateMany(filter, update, options);
  }

  // ================= FIND ONE AND UPDATE =================
  async findOneAndUpdate(
    filter: QueryFilter<T>,
    update: UpdateQuery<T>,
    options?: QueryOptions,
  ): Promise<Doc<T> | null> {
    if (Array.isArray(update)) {
      update.push({ $set: { __v: { $add: ['$__v', 1] } } });
      return this.model.findOneAndUpdate(filter, update, {
        new: true,
        ...options,
        updatePipeline: true,
      });
    }
    return this.model.findOneAndUpdate(filter, update, {
      new: true,
      ...options,
      $incr: { __v: 1 },
    });
  }

  // ================= FIND BY ID AND UPDATE =================
  async findByIdAndUpdate(
    id: string | Types.ObjectId,
    update: UpdateQuery<T>,
    options?: QueryOptions,
  ): Promise<Doc<T> | null> {
    return this.model.findByIdAndUpdate(id, update, {
      new: true,
      ...options,
    });
  }

  // ================= DELETE ONE =================
  async deleteOne(filter: QueryFilter<T>): Promise<DeleteResult> {
    return this.model.deleteOne(filter);
  }

  // ================= DELETE MANY =================
  async deleteMany(filter: QueryFilter<T>): Promise<DeleteResult> {
    return this.model.deleteMany(filter);
  }

  // ================= FIND ONE AND DELETE =================
  async findOneAndDelete(filter: QueryFilter<T>): Promise<Doc<T> | null> {
    return this.model.findOneAndDelete(filter);
  }

  // ================= FIND BY ID AND DELETE =================
  async findByIdAndDelete(id: string | Types.ObjectId): Promise<Doc<T> | null> {
    return this.model.findByIdAndDelete(id);
  }

  // ================= COUNT =================
  async count(filter: QueryFilter<T> = {}): Promise<number> {
    return this.model.countDocuments(filter);
  }

  // ================= EXISTS =================
  async exists(filter: QueryFilter<T>): Promise<boolean> {
    const result = await this.model.exists(filter);
    return !!result;
  }
}
