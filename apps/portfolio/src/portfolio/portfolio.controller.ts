import { Controller, Post, Body, Res,  } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { Response } from 'express';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post('getOnePortfolio')
  async getOnePortfolio(@Body() userData: any, @Res() res: Response){
    const result = await this.portfolioService.getOnePortfolio(userData);
    res.status(200).json(result);
  }
}
