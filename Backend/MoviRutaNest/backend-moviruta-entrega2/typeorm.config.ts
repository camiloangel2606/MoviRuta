import 'reflect-metadata';
import path from 'path';
import { DataSource } from 'typeorm';

const rootDir = __dirname.endsWith('dist') ? path.join(__dirname, '..') : __dirname;
const srcDir = path.join(rootDir, 'src');
const distDir = path.join(rootDir, 'dist');

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  entities: [
    path.join(srcDir, '**', '*.entity{.ts,.js}'),
    path.join(distDir, '**', '*.entity{.ts,.js}'),
  ],
  migrations: [
    path.join(srcDir, 'migrations', '*{.ts,.js}'),
    path.join(distDir, 'migrations', '*{.ts,.js}'),
  ],

  // SOLO dev. Antes de entregar: false.
  synchronize: false,

  // útil en dev
  logging: false,
});