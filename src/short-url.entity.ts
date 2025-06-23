import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClickStat } from './click-stat.entity';

@Entity()
export class ShortUrl {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  short: string;

  @Column()
  originalUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true, type: 'timestamp' })
  expiresAt?: Date;

  @Column({ default: 0 })
  clickCount: number;

  @OneToMany(() => ClickStat, (stat) => stat.shortUrl)
  clicks: ClickStat[];
}
