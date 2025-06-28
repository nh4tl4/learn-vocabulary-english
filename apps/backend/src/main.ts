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

  // Force use Render's PORT or fallback to 10000
  const port = process.env.PORT || 10000;

  // Log the port for debugging
  console.log(`Environment PORT: ${process.env.PORT}`);
  console.log(`Using port: ${port}`);

  await app.listen(port, '0.0.0.0');
  console.log(`Backend running on port ${port}`);
  console.log(`Health check available at: http://0.0.0.0:${port}/api/health`);
}
bootstrap();
