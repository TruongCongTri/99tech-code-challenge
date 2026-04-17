import { prisma } from '@/common/configs/prisma';

export abstract class BaseRepository<T> {
  protected model: any;

  constructor(modelName: string) {
    // Dynamically access Prisma model
    this.model = (prisma as any)[modelName];
  }

  public async findById(id: string, options?: { select?: any; include?: any }): Promise<any> {
    return this.model.findUnique({
      where: { id },
      ...options,
    });
  }

  async findAll(): Promise<T[]> {
    return this.model.findMany();
  }

  public async update(id: string, data: any): Promise<any> {
    return this.model.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string): Promise<any> {
    return this.model.delete({
      where: { id },
    });
  }
}
