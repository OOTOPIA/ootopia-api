import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Pool } from 'pg';
import { PostsCommentsCount } from 'src/posts/entities/comments-count.entity';
import { PostsComments } from 'src/posts/entities/comments.entity';
import { Posts, PostsLikes, PostsLikesCount } from 'src/posts/posts.entity';
import { InterestsTags } from 'src/interests-tags/entities/interests-tags.entity';
import { Users } from 'src/users/users.entity';
import { InterestsTagsUsers } from 'src/interests-tags/entities/interests-tags-users.entity';
import { UsersAddresses } from 'src/users/entities/users-addresses.entity';
import { Cities } from 'src/cities/cities.entity';

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
        synchronize: true,
        entities: [
          Users,
          Posts,
          PostsLikes,
          PostsLikesCount,
          PostsComments,
          PostsCommentsCount,
          InterestsTags,
          InterestsTagsUsers,
          Cities,
          UsersAddresses
        ],
        migrationsTableName: 'migration',
        migrations: ['src/migration/*.ts'],
        cli: {
          migrationsDir: 'src/migration',
        },
        ssl: this.isProduction(),
      };
    }
  
    public getPoolPg() {
      return new Pool({
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DATABASE,
        password: process.env.POSTGRES_PASSWORD,
        port: 5432,
      });
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