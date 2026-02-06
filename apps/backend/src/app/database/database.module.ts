import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../entities/account.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'postgres',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.POSTGRES_USER || 'jobly',
      password: process.env.POSTGRES_PASSWORD || 'jobly',
      database: process.env.POSTGRES_DB || 'jobly_db',
      entities: [Account],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([Account]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
