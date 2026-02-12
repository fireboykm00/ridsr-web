import { Document, Model, UpdateQuery } from 'mongoose';
import { dbConnect } from '../db';

// Define FilterQuery type locally since it's not exported in newer mongoose versions
type FilterQuery<T> = {
  [P in keyof T]?: T[P] | { $regex?: RegExp; $in?: any[]; $gte?: any; $lte?: any; $ne?: any };
} & {
  $or?: FilterQuery<T>[];
  $and?: FilterQuery<T>[];
};

export abstract class BaseService<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async findAll(filter: FilterQuery<T> = {}): Promise<T[]> {
    await dbConnect();
    return this.model.find(filter).lean();
  }

  async findById(id: string): Promise<T | null> {
    await dbConnect();
    return this.model.findById(id).lean();
  }

  async create(data: Partial<T>): Promise<T> {
    await dbConnect();
    return this.model.create(data);
  }

  async updateById(id: string, data: UpdateQuery<T>): Promise<T | null> {
    await dbConnect();
    return this.model.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async deleteById(id: string): Promise<boolean> {
    await dbConnect();
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    await dbConnect();
    return this.model.countDocuments(filter);
  }

  async findWithPagination(
    filter: FilterQuery<T> = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: T[]; total: number; page: number; totalPages: number }> {
    await dbConnect();
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.model.find(filter).skip(skip).limit(limit).lean(),
      this.model.countDocuments(filter)
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }
}