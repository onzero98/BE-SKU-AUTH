import { Injectable, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credential.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { KafkaService } from './kafka.service';
import { KafkaHandler } from './kafka.handler';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private kafkaService: KafkaService,
    private kafkaHandler: KafkaHandler,
  ) {}

  async onModuleInit() {
    // await this.kafkaService.subscribe('findUsername', this.kafkaHandler.handleFindUsername.bind(this.kafkaHandler));
    await this.kafkaService.subscribe('updateHasAccount', this.kafkaHandler.handleUpdateHasAccount.bind(this.kafkaHandler));
  }

  async signIn(authcredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
    const user = await this.userService.validateUser(authcredentialsDto);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username: user.username, ha: user.hasAccount };
    const accessToken = this.jwtService.sign(payload);

    await this.kafkaService.publish('signIn', { ...authcredentialsDto, accessToken });

    await this.kafkaService.subscribe('signIn', this.kafkaHandler.handleSignIn.bind(this.kafkaHandler));

    return { accessToken };
  }

  async signUp(authcredentialsDto: AuthCredentialsDto): Promise<void> {
    await this.userService.createUser(authcredentialsDto);

    await this.kafkaService.publish('signUp', authcredentialsDto);

    const result = await this.kafkaService.subscribe('signUp', this.kafkaHandler.handleSignUp.bind(this.kafkaHandler));
    console.log(result);
    return result;
  }
}
