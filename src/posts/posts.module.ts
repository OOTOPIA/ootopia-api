import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsRepository } from './posts.repository';
import { VideoModule } from 'src/video/video.module';
import { CommentsService } from './services/comments.service';
import { CommentsRepository } from './repositories/comments.repository';
import { AddressesRepository } from 'src/addresses/addresses.repository';
import { InterestsTagsModule } from 'src/interests-tags/interests-tags.module';
import { CitiesModule } from 'src/cities/cities.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostsRepository]), 
    TypeOrmModule.forFeature([CommentsRepository]), 
    TypeOrmModule.forFeature([AddressesRepository]),
    VideoModule,
    InterestsTagsModule,
    CitiesModule
  ],
  providers: [PostsService, CommentsService],
  controllers: [PostsController],
  exports: [PostsService]
})
export class PostsModule {}
