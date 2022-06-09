import { Module, forwardRef } from '@nestjs/common';
import { InterestsTagsService } from './services/interests-tags.service';
import { InterestsTagsController } from './interests-tags.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterestsTagsRepository } from './repositories/interests-tags.repository';
import { InterestsTagsUsersService } from './services/interests-tags-users.service';
import { InterestsTagsUsersRepository } from './repositories/interests-tags-users.repository';
import { InterestsTagsPostsRepository } from './repositories/interests-tags-posts.repository';
import { StrapiModule } from '../strapi/strapi.module';
import { SqsWorkerModule } from '../sqs-worker/sqs-worker.module';

@Module({
  imports: [
    forwardRef(() => StrapiModule),
    forwardRef(() => SqsWorkerModule),
    TypeOrmModule.forFeature([
      InterestsTagsRepository, 
      InterestsTagsUsersRepository,
      InterestsTagsPostsRepository
    ]),
  ],
  providers: [InterestsTagsService, InterestsTagsUsersService],
  controllers: [InterestsTagsController],
  exports: [InterestsTagsService, InterestsTagsUsersService]
})
export class InterestsTagsModule {}
