import { Injectable } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credential.dto';
import { KafkaService } from './kafka.service';
import { KafkaHandler } from './kafka.handler';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly kafkaHandler: KafkaHandler,
    private readonly jwtService: JwtService, // JwtService 추가
  ) {}

  async signIn(authcredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
    // JwtService를 이용하여 accessToken을 생성합니다.
    const payload = { username: authcredentialsDto.username, sub: 1 };
    const accessToken = await this.jwtService.sign(payload);
  
    // Kafka 메시지를 발행합니다.
    await this.kafkaService.publish('signIn', { ...authcredentialsDto, accessToken });
  
    // Kafka 메시지를 구독하고 처리합니다.
    await this.kafkaService.subscribe('signIn', this.kafkaHandler.handleSignIn.bind(this.kafkaHandler));
  
    return { accessToken };
  }

  async signUp(authcredentialsDto: AuthCredentialsDto): Promise<any> {
    // Kafka 메시지를 발행합니다.
    await this.kafkaService.publish('signUp', authcredentialsDto);

    // Kafka 메시지를 구독하고 처리합니다.
    const result = await this.kafkaService.subscribe('signUp', this.kafkaHandler.handleSignUp.bind(this.kafkaHandler));
    return result;
  }
}