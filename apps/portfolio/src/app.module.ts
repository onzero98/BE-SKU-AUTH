import { Module } from '@nestjs/common';
import { sequelizeConfig } from './configs/sequelize.config';
import { SequelizeModule } from '@nestjs/sequelize';
import { PortfolioModule } from './portfolio/portfolio.module';
import { Portfolio } from './portfolio/portfolio.model';

@Module({
  imports: [
    SequelizeModule.forRoot(sequelizeConfig),
    SequelizeModule.forFeature([Portfolio]),
    PortfolioModule
  ],
  
})
export class AppModule {}