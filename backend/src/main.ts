import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  // --- Settingan Swagger Mulai ---
  const config = new DocumentBuilder()
    .setTitle('Dokumentasi API RuMate')
    .setDescription('Daftar endpoint API untuk aplikasi RuMate')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  // --- Settingan Swagger Selesai ---

  app.enableCors(); // Biar Frontend bisa akses
  await app.listen(3000);
}
bootstrap();