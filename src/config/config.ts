import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Pool } from 'pg';
import { PostsCommentsCount } from 'src/posts/entities/comments-count.entity';
import { PostsComments } from 'src/posts/entities/comments.entity';
import { Posts, PostsLikes, PostsLikesCount } from 'src/posts/posts.entity';
import { InterestsTags } from 'src/interests-tags/entities/interests-tags.entity';
import { Users } from 'src/users/users.entity';
import { InterestsTagsUsers } from 'src/interests-tags/entities/interests-tags-users.entity';
import { Addresses } from 'src/addresses/addresses.entity';
import { Cities } from 'src/cities/cities.entity';
import { InterestsTagsPosts } from 'src/interests-tags/entities/interests-tags-posts.entity';
import { Wallets } from 'src/wallets/wallets.entity';
import { WalletTransfers } from 'src/wallet-transfers/wallet-transfers.entity';
import { GeneralConfig } from 'src/general-config/general-config.entity';
import { PostsWatchedVideotime } from 'src/posts/entities/posts-watched-videotime.entity';
import { PostsTimelineViewTime } from 'src/posts/entities/posts-timeline-view-time.entity';
import { UsersAppUsageTime } from 'src/users/entities/users-app-usage-time.entity';
import { Badges } from 'src/badges/entities/badges.entity';
import { InvitationsCode } from 'src/invitations-codes/entities/invitations-code.entity';

require('dotenv').config();

class ConfigService {
    constructor(private env: { [k: string]: string | undefined }) {}
  
    public getValue(key: string, throwOnMissing = true): string {
      const value = this.env[key];
      if (!value && throwOnMissing) { 
        throw new Error(`config error - missing env.${key}`);
      }
  
      return value;
    }
  
    public ensureValues(keys: string[]) {
      keys.forEach(k => this.getValue(k, true));
      return this;
    }
  
    public getPort() {
      return this.getValue('PORT', true);
    }
  
    public isProduction() {
      const mode = this.getValue('MODE', false);
      return mode != 'DEV';
    }
  
    public getTypeOrmConfig(): TypeOrmModuleOptions {
      return {
        type: 'postgres',
        host: this.getValue('POSTGRES_HOST'),
        port: parseInt(this.getValue('POSTGRES_PORT')),
        username: this.getValue('POSTGRES_USER'),
        password: this.getValue('POSTGRES_PASSWORD'),
        database: this.getValue('POSTGRES_DATABASE'),
        extra: {
          max: 1000, // set pool max size to 20
          idleTimeoutMillis: 1000 * 60, // close idle clients after 1 second
          connectionTimeoutMillis: 15000, // return an error after 1 second if connection could not be established
        },
        synchronize: true,
        entities: [
          Users,
          Posts,
          PostsLikes,
          PostsLikesCount,
          PostsComments,
          PostsCommentsCount,
          PostsWatchedVideotime,
          PostsTimelineViewTime,
          InterestsTags,
          InterestsTagsUsers,
          InterestsTagsPosts,
          Cities,
          Addresses,
          Wallets,
          WalletTransfers,
          GeneralConfig,
          UsersAppUsageTime,
          Badges,
          InvitationsCode,
        ],
        migrationsTableName: 'migration',
        migrations: ['src/migration/*.ts'],
        cli: {
          migrationsDir: 'src/migration',
        },
        ssl: this.isProduction(),
      };
    }
  }
  
  const configService = new ConfigService(process.env).ensureValues([
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DATABASE'
  ]);
  
  export { configService };