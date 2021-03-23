import { Module } from '@nestjs/common';
import { InterestsTagsService } from './services/interests-tags.service';
import { InterestsTagsController } from './interests-tags.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterestsTagsRepository } from './repositories/interests-tags.repository';
import { InterestsTagsUsersService } from './services/interests-tags-users.service';
import { InterestsTagsUsersRepository } from './repositories/interests-tags-users.repository';

@Module({
  imports: [TypeOrmModule.forFeature([InterestsTagsRepository]), TypeOrmModule.forFeature([InterestsTagsUsersRepository])],
  providers: [InterestsTagsService, InterestsTagsUsersService],
  controllers: [InterestsTagsController],
  exports: [InterestsTagsService, InterestsTagsUsersService]
})
export class InterestsTagsModule {}
