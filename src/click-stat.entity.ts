import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ShortUrl } from './short-url.entity';

@Entity()
export class ClickStat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ShortUrl, (shortUrl) => shortUrl.clicks, {
    onDelete: 'CASCADE',
  })
  shortUrl: ShortUrl;

  @CreateDateColumn()
  clickedAt: Date;

  @Column()
  ip: string;
}
