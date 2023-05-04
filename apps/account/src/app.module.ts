import { Module } from '@nestjs/common';
import { AccountModule } from './account/account.module';
// import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [AccountModule],
})
export class AppModule {}
