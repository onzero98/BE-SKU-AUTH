import { Module } from '@nestjs/common';
import { sequelizeConfig } from './configs/sequelize.config';
import { SequelizeModule } from '@nestjs/sequelize';
import { stockPrice } from '../src/stockPrice.model';
import { StockPriceModule } from './stockPrice/stockPrice.module';
import { CrawlerModule } from './crawler/crawler.module';
import { StockPriceGateway } from './stockPrice/stockPrice.gateway';

@Module({
  imports: [
    SequelizeModule.forRoot(sequelizeConfig),
    SequelizeModule.forFeature([stockPrice]),
    StockPriceModule,
    CrawlerModule,
  ],
  providers: [StockPriceGateway],
})
export class AppModule {}