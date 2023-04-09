import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credential.dto';
import { KafkaService } from './kafka.service';
import { KafkaHandler } from './kafka.handler';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private readonly kafkaService: KafkaService,
    private readonly kafkaHandler: KafkaHandler,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(authcredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
    // JwtService를 이용하여 accessToken을 생성합니다.
    const { username, password } = authcredentialsDto;
    const user = await this.userRepository.findOneBy({ username, password });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username: user.username, sub: user.id };
    const accessToken = await this.jwtService.sign(payload);
  
    // Kafka 메시지를 발행합니다.
    await this.kafkaService.publish('signIn', { ...authcredentialsDto, accessToken });
  
    // Kafka 메시지를 구독하고 처리합니다.
    await this.kafkaService.subscribe('signIn', this.kafkaHandler.handleSignIn.bind(this.kafkaHandler));
  
    return { accessToken };
  }

  async signUp(authcredentialsDto: AuthCredentialsDto): Promise<any> {
    const { username, password } = authcredentialsDto;
    const userExists = await this.userRepository.findOneBy({ username });
    if (userExists) {
      throw new BadRequestException('Username already exists');
    }

    const user = new User();
    user.username = username;
    user.password = password;

    await this.userRepository.save(user);
    // Kafka 메시지를 발행합니다.
    await this.kafkaService.publish('signUp', authcredentialsDto);

    // Kafka 메시지를 구독하고 처리합니다.
    const result = await this.kafkaService.subscribe('signUp', this.kafkaHandler.handleSignUp.bind(this.kafkaHandler));
    return result;
  }
}
