import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortUrl } from './short-url.entity';
import { ClickStat } from './click-stat.entity';
import { ShortenerService } from './shortener.service';
import { ShortenerController } from './shortener.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5433', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      database: process.env.DB_NAME || 'shortener',
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([ShortUrl, ClickStat]),
  ],
  controllers: [ShortenerController],
  providers: [ShortenerService],
})
export class AppModule {}
