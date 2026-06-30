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
} from 'mongoose';

type Doc<T> = HydratedDocument<T>;

export class DBRepo<T extends object> {
  constructor(protected readonly model: Model<T>) {}

  // ================= FIND MANY =================
  async find(
    filter: QueryFilter<T> = {},
    projection?: ProjectionType<T>,
    options?: QueryOptions,
  ): Promise<Doc<T>[]> {
    return this.model.find(filter, projection, options);
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
    return this.model.findOneAndUpdate(filter, update, {
      new: true,
      ...options,
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
