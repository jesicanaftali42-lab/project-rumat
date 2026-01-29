import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { ContactModule } from './contact/contact.module';
import { RoomsModule } from './rooms/rooms.module';
import { BookingsModule } from './bookings/bookings.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'postgres',
      password: 'Nikitalulu26',
      database: 'rumat_db',
      autoLoadEntities: true,
      synchronize: true,
    }),

    AuthModule,
    ContactModule,
    RoomsModule,
    BookingsModule,
    DashboardModule, // ✅ dashboard module
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
