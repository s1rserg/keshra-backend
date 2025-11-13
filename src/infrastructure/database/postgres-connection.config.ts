import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export const postgresConnectionConfig: PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: +process.env.POSTGRES_PORT!,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,

  // Never use schema auto-sync in a migrations-based workflow
  synchronize: false,
  migrationsRun: false,
  migrationsTableName: 'migrations',

  // Dev (TS) + Prod (JS)
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/**/*.js'],
};
