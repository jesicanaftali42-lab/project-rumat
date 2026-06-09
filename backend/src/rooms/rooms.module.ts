import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './room.entity';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { Booking } from '../bookings/booking.entity';
// 👇 Import Multer & Utilities
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, Booking]),
    // 👇 KONFIGURASI MULTER (Agar file tersimpan di folder uploads)
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads', // Folder tujuan penyimpanan
        filename: (req, file, cb) => {
          // Generate nama file unik: image-TIMESTAMP-RANDOM.ext
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  ],
  controllers: [RoomsController],
  providers: [RoomsService],
})
export class RoomsModule {}