import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.entity';
import { AuthCredentialsDto } from '../auth/dto/auth-credential.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User) private userModel: typeof User) {}

  async createUser(user: Partial<User>): Promise<void> {
    const { username } = user;
    const found = await this.userModel.findOne({ where: { username } });
    if (found) {
      throw new ConflictException('Username already exists');
    }
    await this.userModel.create(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ where: { username } });
  }

  async validateUser(authCredentialsDto: AuthCredentialsDto): Promise<User> {
    const { username, password } = authCredentialsDto;

    const user = await this.findByUsername(username);

    if (user && (await user.validatePassword(password))) {
      return user;
    } else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
