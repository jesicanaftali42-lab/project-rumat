import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module'; // <--- 1. Pastikan ini ada
import { User } from './auth/user.entity';       // <--- 2. Import User yang baru dibuat

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'Jesica23',    // <--- Pastikan passwordmu benar
      database: 'db_rumat',
      entities: [User],        // <--- 3. Masukkan User ke sini
      synchronize: true,
    }),
    AuthModule, // <--- 4. Hapus tanda // (uncomment)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}