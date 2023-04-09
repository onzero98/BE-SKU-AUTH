import { NestFactory } from '@nestjs/core';
import { MemberModule } from './member.module';

async function bootstrap() {
  const app = await NestFactory.create(MemberModule);
  await app.listen(3000);
}
bootstrap();
