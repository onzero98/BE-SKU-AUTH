import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';

describe('PortfolioController', () => {
  let portfolioController: PortfolioController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PortfolioController],
      providers: [PortfolioService],
    }).compile();

    portfolioController = app.get<PortfolioController>(PortfolioController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(portfolioController.getHello()).toBe('Hello World!');
    });
  });
});
