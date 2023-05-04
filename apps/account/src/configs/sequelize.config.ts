import { SequelizeModuleOptions } from '@nestjs/sequelize';
import * as config from 'config';

const dbConfig = config.get('db-account');

export const sequelizeConfig: SequelizeModuleOptions = {
  dialect: dbConfig.type,
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  models: [__dirname + '/../**/*.entity.ts'],
  autoLoadModels: true,
  synchronize: dbConfig.synchronize,
};
