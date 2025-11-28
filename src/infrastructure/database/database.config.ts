import { registerAs } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { postgresConnectionConfig } from './postgres-connection.config';

export const dbConfig = registerAs<TypeOrmModuleOptions>('database-config', () => {
  return {
    ...postgresConnectionConfig,
    type: 'postgres',
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT!,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,

    ssl: process.env.APP_ENV !== 'dev',

    // Never use schema auto-sync in a migrations-based workflow
    synchronize: true,
    migrationsRun: false,
    migrationsTableName: 'migrations',
    migrations: ['dist/src/migrations/**/*.js'],
    autoLoadEntities: true, // ! local
  };
});
