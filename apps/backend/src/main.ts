import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global exception filter for better error handling
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global logging interceptor for request/response monitoring
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Enable CORS - Allow all origins in production
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? true : 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe with better error messages
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Global prefix
  app.setGlobalPrefix('api');

  // Force use Render's PORT or fallback to 10000
  const port = process.env.PORT || 10000;

  // Log the port for debugging
  console.log(`Environment PORT: ${process.env.PORT}`);
  console.log(`Using port: ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Backend running on port ${port}`);
  console.log(`📊 Health check available at: http://0.0.0.0:${port}/api/health`);
}
bootstrap();
