import { NestFactory } from '@nestjs/core';
import { AccountModule } from './account/account.module';

async function bootstrap() {
  const app = await NestFactory.create(AccountModule);
  app.enableCors();
  await app.listen(8082);
}
bootstrap();
