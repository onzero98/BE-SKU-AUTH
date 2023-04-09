import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as config from 'config';
import { User } from "../auth/user.entity";

const dbConfig = config.get('db');

export const typeORMConfig: TypeOrmModuleOptions = {
  type: dbConfig.type,
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  entities: [__dirname + '/../**/*.entity.ts', User],
  synchronize: dbConfig.synchronize
}