import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CrawlerController } from './crawler.controller';
import { CrawlerService } from './crawler.service';
import { KafkaService } from '../kafka/kafka.service';

@Module({
  imports: [
    ScheduleModule.forRoot()
  ],
  controllers: [CrawlerController],
  providers: [CrawlerService, KafkaService],
})
export class CrawlerModule {}
