import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS - Allow all origins in production
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? true : 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Global prefix
  app.setGlobalPrefix('api');

  // Use PORT environment variable from Render (usually 10000) or default to 3000
  const port = process.env.PORT || 10000;
  await app.listen(port, '0.0.0.0');
  console.log(`Backend running on port ${port}`);
}
bootstrap();
