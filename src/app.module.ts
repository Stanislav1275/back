import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ShortUrl } from './short-url.entity';
import { ClickStat } from './click-stat.entity';
import { ShortenerService } from './shortener.service';
import { ShortenerController } from './shortener.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'db',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      database: process.env.DB_NAME || 'shortener',
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([ShortUrl, ClickStat]),
  ],
  controllers: [AppController, ShortenerController],
  providers: [AppService, ShortenerService],
})
export class AppModule {}
