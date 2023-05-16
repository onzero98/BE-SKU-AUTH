import { Module } from '@nestjs/common';
import { sequelizeConfig } from './configs/sequelize.config';
import { SequelizeModule } from '@nestjs/sequelize';
import { stockPrice } from '../src/stockPrice.model';
import { StockPriceModule } from './stockPrice/stockPrice.module';
import { CrawlerModule } from './crawler/crawler.module';
import { StockPriceAllGateway } from './stockPrice/stockPriceAll.gateway';
import { StockPriceMainGateway } from './stockPrice/stockPriceMain.gateway';

@Module({
  imports: [
    SequelizeModule.forRoot(sequelizeConfig),
    SequelizeModule.forFeature([stockPrice]),
    StockPriceModule,
    CrawlerModule,
  ],
  providers: [StockPriceAllGateway, StockPriceMainGateway],
})
export class AppModule {}