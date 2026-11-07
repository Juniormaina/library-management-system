import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // Ensure local Neon env vars are available when running outside Prisma CLI.
  // Safe in production: dotenv is optional and existing env vars take precedence.
  if (!process.env.DATABASE_URL) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { config } = require('dotenv') as typeof import('dotenv');
      config({ path: '../.env.local' });
    } catch {
      // dotenv may be unavailable in production installs; rely on platform env vars.
    }
  }

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
