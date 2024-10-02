import 'dotenv/config';
import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { User } from '@modules/user/entities/user.entity';

console.log(process.env.POSTGRES_HOST);

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: +process.env.POSTGRES_PORT,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    synchronize: false,
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    entities: [User],
});
