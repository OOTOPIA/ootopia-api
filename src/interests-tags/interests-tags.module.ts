import { Module } from '@nestjs/common';
import { InterestsTagsService } from './interests-tags.service';
import { InterestsTagsController } from './interests-tags.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterestsTagsRepository } from './interests-tags.repository';

@Module({
  imports: [TypeOrmModule.forFeature([InterestsTagsRepository])],
  providers: [InterestsTagsService],
  controllers: [InterestsTagsController]
})
export class InterestsTagsModule {}
