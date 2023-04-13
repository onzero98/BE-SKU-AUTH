import { Controller, Post, Body, ValidationPipe, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credential.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signUp(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto) {
    return await this.authService.signUp(authCredentialsDto);
  }

  @Post('signin')
  async signIn(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto, @Res() res: Response) {
    const { accessToken } = await this.authService.signIn(authCredentialsDto);
    res.status(200).json({ accessToken });
  }
}
