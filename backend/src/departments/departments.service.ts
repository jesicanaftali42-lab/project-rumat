import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './department.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly repo: Repository<Department>,
  ) {}

  findAll() {
    return this.repo.find({
      where: { isActive: true },
      order: { code: 'ASC' },
    });
  }

  async findOne(id: number) {
    const dep = await this.repo.findOneBy({ id });
    if (!dep) throw new NotFoundException('Department not found');
    return dep;
  }

  create(dto: { code: string; name: string }) {
    const dep = this.repo.create({
      code: dto.code.trim().toUpperCase(),
      name: dto.name.trim(),
      isActive: true,
    });
    return this.repo.save(dep);
  }

  async update(id: number, dto: { code?: string; name?: string; isActive?: boolean }) {
    const dep = await this.findOne(id);

    if (dto.code !== undefined) dep.code = dto.code.trim().toUpperCase();
    if (dto.name !== undefined) dep.name = dto.name.trim();
    if (dto.isActive !== undefined) dep.isActive = dto.isActive;

    return this.repo.save(dep);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.delete(id);
    return { message: 'Department deleted' };
  }
}
