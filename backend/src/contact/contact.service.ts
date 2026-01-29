import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>,
  ) {}

  create(dto: CreateContactDto) {
    const contact = this.contactRepo.create(dto);
    return this.contactRepo.save(contact);
  }

  findAll() {
    return this.contactRepo.find({ order: { id: 'DESC' } });
  }

  async findOne(id: number) {
    const contact = await this.contactRepo.findOneBy({ id });
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  async update(id: number, dto: UpdateContactDto) {
    await this.findOne(id);
    await this.contactRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.contactRepo.delete(id);
    return { message: 'Contact deleted' };
  }
}
