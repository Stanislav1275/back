import {
  IsDateString,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ShortenDto {
  @ApiProperty({
    description: 'Original URL to shorten',
    example: 'https://very-long-link.com/some/path?with=parameters',
    required: true,
  })
  @IsString()
  @IsUrl({}, { message: 'Please provide a valid URL' })
  originalUrl: string;

  @ApiPropertyOptional({
    description: 'Custom alias for the shortened URL (max 20 chars)',
    example: 'my-custom-link',
    maxLength: 20,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Alias cannot be longer than 20 characters' })
  alias?: string;

  @ApiPropertyOptional({
    description: 'Expiration date for the shortened URL (ISO string)',
    example: '2024-12-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Please provide a valid ISO date string' })
  expiresAt?: string;
}

export class ShortenResponseDto {
  @ApiProperty({
    description: 'Generated short URL code',
    example: 'abc123',
  })
  shortUrl: string;
}

export class ShortUrlInfoDto {
  @ApiProperty({
    description: 'Original URL',
    example: 'https://very-long-link.com/some/path',
  })
  originalUrl: string;

  @ApiProperty({
    description: 'Short URL code',
    example: 'abc123',
  })
  short: string;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T12:00:00Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Expiration date',
    example: '2024-12-31T23:59:59Z',
  })
  expiresAt?: Date;

  @ApiProperty({
    description: 'Number of clicks',
    example: 42,
  })
  clickCount: number;
}

export class AnalyticsResponseDto {
  @ApiProperty({
    description: 'Total number of clicks',
    example: 42,
  })
  clickCount: number;

  @ApiProperty({
    description: 'Last 5 IP addresses that accessed the link',
    example: ['192.168.1.1', '10.0.0.1'],
    isArray: true,
  })
  last5Ips: string[];
}

export class DeleteResponseDto {
  @ApiProperty({
    description: 'Deletion confirmation message',
    example: 'Deleted',
  })
  message: string;
}
