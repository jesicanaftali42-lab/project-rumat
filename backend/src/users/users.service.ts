import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common'; // 👈 Tambah OnModuleInit
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/user.entity'; // Pastikan path ini benar sesuai struktur foldermu
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit { // 👈 Tambah implements OnModuleInit
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // 🔥 FITUR AUTO-CREATE SUPER ADMIN (Baru) 🔥
  // Method ini jalan otomatis pas aplikasi start
  async onModuleInit() {
    const adminExists = await this.usersRepository.findOneBy({ username: 'superadmin' });
    
    if (!adminExists) {
      console.log('⚠️ Database User Kosong. Membuat Super Admin otomatis...');
      
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('admin123', salt); // Password: admin123
      
      const admin = this.usersRepository.create({
        username: 'superadmin',
        email: 'admin@rumate.com',
        password: hashedPassword,
        role: 'super_admin', // Pastikan string ini sesuai dengan ENUM role di database kamu
        division: 'IT Support',
        // Tambahkan field lain jika di entity User ada yang @Column() wajib (not null)
      });

      await this.usersRepository.save(admin);
      console.log('✅ SUKSES! Super Admin dibuat.');
      console.log('👉 Username: superadmin');
      console.log('👉 Password: admin123');
    }
  }

  // ✅ 1. GET ALL USERS
  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      order: { id: 'ASC' }, 
    });
  }

  // ✅ 2. GET USER BY ID
  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ✅ 3. CREATE USER
  async create(userData: Partial<User>): Promise<User> {
    // 1. Cek Password
    const plainPassword = userData.password || 'password123'; 

    // 2. Hash Password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // 3. Buat Object Instance
    const newUser = this.usersRepository.create({
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      role: userData.role || 'employee',
      division: userData.division || 'General', 
    });

    // 4. Simpan ke DB
    return this.usersRepository.save(newUser);
  }

  // ✅ 4. UPDATE USER
  async update(id: number, attrs: Partial<User>) {
    const user = await this.findOne(id); 

    // Jika password diubah, hash ulang
    if (attrs.password) {
      const salt = await bcrypt.genSalt();
      attrs.password = await bcrypt.hash(attrs.password, salt);
    }

    // Merge data lama dengan data baru
    Object.assign(user, attrs);

    return this.usersRepository.save(user);
  }

  // ✅ 5. DELETE USER
  async remove(id: number) {
    const result = await this.usersRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return { message: 'User successfully deleted' };
  }
}