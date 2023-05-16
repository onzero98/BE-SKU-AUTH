import { Controller, Post, Get, Body, Res } from '@nestjs/common';
import { AccountService } from './account.service';
import { Response } from 'express';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('create')
  async createAccount(@Body('username') username: string, @Res() res: Response) {
    const { result } = await this.accountService.createAccount(username);
    res.status(200).json({ result });
  }

  @Post('userCredit')
  async getUserCredit(@Body('username') username: string, @Res() res: Response){
    const result = await this.accountService.getUserCredit(username);
    res.status(200).json(result.credit);
  }
}