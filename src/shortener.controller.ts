import {
  Body,
  Controller,
  Delete,
  Get,
  GoneException,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Redirect,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ShortenerService } from './shortener.service';
import {
  AnalyticsResponseDto,
  DeleteResponseDto,
  ShortenDto,
  ShortenResponseDto,
  ShortUrlInfoDto,
} from './shorten.dto';
import { Request, Response } from 'express';

@ApiTags('URL Shortener')
@Controller()
export class ShortenerController {
  constructor(private readonly service: ShortenerService) {}

  @Post('shorten')
  @ApiOperation({ summary: 'Create a shortened URL' })
  @ApiBody({ type: ShortenDto })
  @ApiResponse({
    status: 201,
    description: 'URL successfully shortened',
    type: ShortenResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input (URL format, alias length)',
  })
  @ApiResponse({
    status: 409,
    description: 'Alias already exists',
  })
  async shorten(@Body() dto: ShortenDto): Promise<ShortenResponseDto> {
    const entity = await this.service.createShortUrl(dto);
    return { shortUrl: entity.short };
  }

  @Get(':short')
  @ApiOperation({ summary: 'Redirect to original URL' })
  @ApiParam({
    name: 'short',
    description: 'Short URL code',
    example: 'abc123',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to original URL',
  })
  @ApiResponse({
    status: 404,
    description: 'Short URL not found',
  })
  @ApiResponse({
    status: 410,
    description: 'Link has expired',
  })
  @Redirect()
  async redirect(
    @Param('short') short: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const entity = await this.service.getOriginalUrl(short);
    if (entity.expiresAt && new Date() > entity.expiresAt) {
      throw new GoneException('Link expired');
    }
    await this.service.incrementClick(short, req.ip!);

    const userAgent = req.headers['user-agent'] || '';

    if (userAgent.includes('Swagger')) {
      return res
        .header('X-Redirect-Location', entity.originalUrl)
        .status(HttpStatus.OK)
        .json({ redirectUrl: entity.originalUrl });
    }

    return res.redirect(HttpStatus.FOUND, entity.originalUrl);
  }

  @Get('info/:short')
  @ApiOperation({ summary: 'Get information about shortened URL' })
  @ApiParam({
    name: 'short',
    description: 'Short URL code',
    example: 'abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'URL information retrieved',
    type: ShortUrlInfoDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Short URL not found',
  })
  async info(@Param('short') short: string): Promise<ShortUrlInfoDto> {
    return this.service.getInfo(short);
  }

  @Delete('delete/:short')
  @ApiOperation({ summary: 'Delete shortened URL' })
  @ApiParam({
    name: 'short',
    description: 'Short URL code',
    example: 'abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'URL successfully deleted',
    type: DeleteResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Short URL not found',
  })
  @HttpCode(200)
  async delete(@Param('short') short: string): Promise<DeleteResponseDto> {
    await this.service.deleteShort(short);
    return { message: 'Deleted' };
  }

  @Get('analytics/:short')
  @ApiOperation({ summary: 'Get analytics for shortened URL' })
  @ApiParam({
    name: 'short',
    description: 'Short URL code',
    example: 'abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics retrieved',
    type: AnalyticsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Short URL not found',
  })
  async analytics(
    @Param('short') short: string,
  ): Promise<AnalyticsResponseDto> {
    return this.service.getAnalytics(short);
  }
}
