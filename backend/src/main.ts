import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ExecutionLogger } from './logger/execution-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(new ExecutionLogger());

  // Enable CORS for Vercel, local frontend, and cross-origin authentication
  app.enableCors({
    origin: ['http://localhost:3000', 'https://career-atlas-cyan.vercel.app'],
    credentials: true,
  });

  // Enable global DTO validation pipe (whitelist: false ensures non-annotated DTO properties are preserved)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`[SERVER] CareerAtlas Backend running on port ${port} (0.0.0.0)`);
}
bootstrap();
