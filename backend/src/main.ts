import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExecutionLogger } from './logger/execution-logger';

// Allow self-signed certificate chains in Docker/cloud proxy environments
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(new ExecutionLogger());
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();

