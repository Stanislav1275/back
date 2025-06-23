import {
  Body,
  Controller,
  Delete,
  Get,
  GoneException,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ShortenerService } from './shortener.service';
import { ShortenDto } from './shorten.dto';

@ApiTags('shortener')
@Controller()
export class ShortenerController {
  constructor(private readonly service: ShortenerService) {}

  @Post('shorten')
  @ApiBody({ type: ShortenDto })
  @ApiResponse({ status: 201, description: 'Short URL created' })
  async shorten(@Body() dto: ShortenDto) {
    const entity = await this.service.createShortUrl(dto);
    return { shortUrl: entity.short };
  }

  @Get(':short')
  @ApiParam({ name: 'short', description: 'Short URL code' })
  @ApiResponse({ status: 302, description: 'Redirects to original URL' })
  async redirect(@Param('short') short: string, @Ip() ip: string) {
    const entity = await this.service.getOriginalUrl(short);
    if (entity.expiresAt && new Date() > entity.expiresAt) {
      throw new GoneException('Link expired');
    }
    await this.service.incrementClick(short, ip);
    return {
      statusCode: HttpStatus.FOUND,
      headers: { Location: entity.originalUrl },
    };
  }

  @Get('info/:short')
  @ApiParam({ name: 'short', description: 'Short URL code' })
  @ApiResponse({ status: 200, description: 'Short URL info' })
  async info(@Param('short') short: string) {
    return this.service.getInfo(short);
  }

  @Delete('delete/:short')
  @ApiParam({ name: 'short', description: 'Short URL code' })
  @ApiResponse({ status: 200, description: 'Short URL deleted' })
  @HttpCode(200)
  async delete(@Param('short') short: string) {
    await this.service.deleteShort(short);
    return { message: 'Deleted' };
  }

  @Get('analytics/:short')
  @ApiParam({ name: 'short', description: 'Short URL code' })
  @ApiResponse({ status: 200, description: 'Analytics' })
  async analytics(@Param('short') short: string) {
    return this.service.getAnalytics(short);
  }
}
