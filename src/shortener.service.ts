import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShortUrl } from './short-url.entity';
import { ClickStat } from './click-stat.entity';
import { ShortenDto } from './shorten.dto';
import { nanoid } from 'nanoid';

@Injectable()
export class ShortenerService {
  constructor(
    @InjectRepository(ShortUrl)
    private shortUrlRepo: Repository<ShortUrl>,
    @InjectRepository(ClickStat)
    private clickStatRepo: Repository<ClickStat>,
  ) {}

  async createShortUrl(dto: ShortenDto): Promise<ShortUrl> {
    const short = dto.alias || nanoid(8);
    if (short.length > 20) throw new ConflictException('Alias too long');
    const exists = await this.shortUrlRepo.findOne({ where: { short } });
    if (exists) throw new ConflictException('Alias already exists');
    const entity = this.shortUrlRepo.create({
      short,
      originalUrl: dto.originalUrl,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });
    return this.shortUrlRepo.save(entity);
  }

  async getOriginalUrl(short: string): Promise<ShortUrl> {
    const entity = await this.shortUrlRepo.findOne({ where: { short } });
    if (!entity) throw new NotFoundException('Short URL not found');
    return entity;
  }

  async incrementClick(short: string, ip: string) {
    const entity = await this.getOriginalUrl(short);
    entity.clickCount++;
    await this.shortUrlRepo.save(entity);
    const stat = this.clickStatRepo.create({ shortUrl: entity, ip });
    await this.clickStatRepo.save(stat);
  }

  async getInfo(short: string) {
    const entity = await this.shortUrlRepo.findOne({ where: { short } });
    if (!entity) throw new NotFoundException('Short URL not found');
    return entity;
  }

  async deleteShort(short: string) {
    const entity = await this.shortUrlRepo.findOne({ where: { short } });
    if (!entity) throw new NotFoundException('Short URL not found');
    await this.shortUrlRepo.remove(entity);
  }

  async getAnalytics(short: string) {
    const entity = await this.shortUrlRepo.findOne({ where: { short } });
    if (!entity) throw new NotFoundException('Short URL not found');
    const count = await this.clickStatRepo.count({
      where: { shortUrl: entity },
    });
    const last5 = await this.clickStatRepo.find({
      where: { shortUrl: entity },
      order: { clickedAt: 'DESC' },
      take: 5,
    });
    return {
      clickCount: count,
      last5Ips: last5.map((s) => s.ip),
    };
  }
}
