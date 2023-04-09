import { Controller, Post, Body, ValidationPipe, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credential.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signIn')
  async signIn(@Body() authcredentialsDto: AuthCredentialsDto, @Res() res: Response) {
    const { accessToken } = await this.authService.signIn(authcredentialsDto); // accessToken을 추출합니다.
    res.status(200).json({ accessToken }); // accessToken만 응답에 포함합니다.
  }

  @Post('signUp')
  async signUp(@Body(ValidationPipe) authcredentialsDto: AuthCredentialsDto) {
    return await this.authService.signUp(authcredentialsDto);
  }
}
