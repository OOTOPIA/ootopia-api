import { Module } from '@nestjs/common';
import { PostCommentRepliesService } from './post-comment-replies.service';
import { PostCommentRepliesController } from './post-comment-replies.controller';
import { PostCommentRepliesRepository } from './post-comment-replies.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModule } from 'src/posts/posts.module';
import { UsersModule } from 'src/users/users.module';
import { NotificationMessagesService } from 'src/notification-messages/notification-messages.service';
import { UsersDeviceTokenModule } from 'src/users-device-token/users-device-token.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostCommentRepliesRepository]),
    PostsModule,
    UsersModule,
    UsersDeviceTokenModule
  ],
  providers: [PostCommentRepliesService, NotificationMessagesService],
  controllers: [PostCommentRepliesController],
})
export class PostCommentRepliesModule {}
