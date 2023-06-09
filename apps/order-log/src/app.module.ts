import { Module } from '@nestjs/common';
import { sequelizeConfig } from './configs/sequelize.config';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrderLogModule } from './orderLog/orderLog.module';
import { OrderLog } from './orderLog/orderLog.model';

@Module({
  imports: [
    SequelizeModule.forRoot(sequelizeConfig),
    SequelizeModule.forFeature([OrderLog]),
    OrderLogModule
  ],
  
})
export class AppModule {}