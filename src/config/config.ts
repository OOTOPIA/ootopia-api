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
import { UsersTrophies } from 'src/users/entities/users-trophies.entity';
import { LearningTracks } from 'src/learning-tracks/learning-tracks.entity';
import { MarketPlaceProducts } from 'src/market-place/entities/market-place-products.entity';
import { LearningTrackCompletedChapters } from 'src/learning-tracks/entities/learning-track-completed-chapters.entity';
import { PostsUsersRewarded } from 'src/posts/entities/posts-users-rewarded.entity';
import { UsersDeviceToken } from 'src/users-device-token/entities/users-device-token.entity';
import { FriendsCircle } from '../friends/entities/friends.entity';
import { PostCommentReplies } from 'src/post-comment-replies/entities/post-comment-replies.entity';
import { Medias } from '../posts/media.entity';
import { AdminUsers } from '../users/entities/admin-user.entity';
import { Complaints } from '../posts/entities/complaints.entity';

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
          max: 20, // set pool max size to 20
          idleTimeoutMillis: 5000 * 60, // close idle clients after 1 second
          connectionTimeoutMillis: 15000, // return an error after 1 second if connection could not be established
        },
        synchronize: true,
        entities: [
          Medias,
          Users,
          Posts,
          PostsLikes,
          PostsLikesCount,
          PostsComments,
          PostsCommentsCount,
          PostsWatchedVideotime,
          PostsTimelineViewTime,
          PostCommentReplies,
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
          UsersTrophies,
          UsersDeviceToken,
          LearningTracks,
          MarketPlaceProducts,
          LearningTrackCompletedChapters,
          PostsUsersRewarded,
          FriendsCircle,
          AdminUsers,
          Complaints
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