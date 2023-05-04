import { NestFactory } from '@nestjs/core';
import { PortfolioModule } from './portfolio.module';

async function bootstrap() {
  const app = await NestFactory.create(PortfolioModule);
  await app.listen(3000);
}
bootstrap();
