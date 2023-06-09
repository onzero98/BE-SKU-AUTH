import { SequelizeModuleOptions } from '@nestjs/sequelize';
import * as config from 'config';

const dbConfig = config.get('db-order-log');

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
  dialectOptions: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  },
};
