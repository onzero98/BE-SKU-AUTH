import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credential.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { KafkaService } from './kafka.service';
import { KafkaHandler } from './kafka.handler';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private kafkaService: KafkaService,
    private kafkaHandler: KafkaHandler,
  ) {}

  async signIn(authcredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
    const user = await this.userService.validateUser(authcredentialsDto);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username: user.username, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    // Kafka 메시지를 발행합니다.
    await this.kafkaService.publish('signIn', { ...authcredentialsDto, accessToken });

    // Kafka 메시지를 구독하고 처리합니다.
    await this.kafkaService.subscribe('signIn', this.kafkaHandler.handleSignIn.bind(this.kafkaHandler));

    return { accessToken };
  }

  async signUp(authcredentialsDto: AuthCredentialsDto): Promise<void> {
    await this.userService.createUser(authcredentialsDto);

    // Kafka 메시지를 발행합니다.
    await this.kafkaService.publish('signUp', authcredentialsDto);

    // Kafka 메시지를 구독하고 처리합니다.
    const result = await this.kafkaService.subscribe('signUp', this.kafkaHandler.handleSignUp.bind(this.kafkaHandler));
    return result;
  }
}
