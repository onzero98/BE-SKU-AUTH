import { Module } from '@nestjs/common';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { KafkaService } from '../kafka/kafka.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Portfolio } from './portfolio.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Portfolio]),
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService, KafkaService],
  exports: [PortfolioService]
})
export class PortfolioModule {}
