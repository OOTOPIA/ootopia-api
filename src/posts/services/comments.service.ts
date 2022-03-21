import { HttpException, Injectable } from '@nestjs/common';
import { NotificationMessagesService } from 'src/notification-messages/notification-messages.service';
import { UsersDeviceTokenService } from 'src/users-device-token/users-device-token.service';
import { UsersService } from 'src/users/users.service';
import { PostsService } from '../posts.service';
import { CommentsRepository } from '../repositories/comments.repository';

@Injectable()
export class CommentsService {

    constructor(
      private readonly commentsRepository : CommentsRepository,
      private readonly usersDeviceTokenService : UsersDeviceTokenService,
      private readonly postsService : PostsService,
      private readonly usersService : UsersService,
      private readonly notificationMessagesService : NotificationMessagesService
    ) {}

    async createComment(commentData) {
      let comment = await this.commentsRepository.createComment(commentData);
      
      if(Array.isArray(commentData.taggedUser) && commentData.taggedUser.length) {
        commentData.taggedUser = [...new Set(commentData.taggedUser)]; //O front enviou ID's iguais e isso vai impedir duplicar notificações
        let [post, userComment, usersToken] = await Promise.all([
          this.postsService.getPostById(<any>comment.postId),
          this.usersService.getUserById(<any>comment.userId),
          this.usersDeviceTokenService.getByUsersId(commentData.taggedUser),
        ]);
        
        let notifications = usersToken.filter( user => !!user).map( (user: any) => 
          ({
            token: user.deviceToken,
            data: {
              type: "user-tagged-in-comment",
              postId: post.id,
              photoUrl : post.thumbnailUrl,
              commentId : comment.id,
              usersName: <any>JSON.stringify([userComment.fullname])
            }
          })
        );
        if (notifications.length) {
          await this.notificationMessagesService.sendFirebaseMessages(notifications);
        }
      }
      
      return comment;
    }

    getComments(postId, page) {
      return this.commentsRepository.getCommentsFromPostId(postId, page);
    }

    getCommentById(commentId: string) {
      return this.commentsRepository.findOneCommentById(commentId);
    }

    async deleteComments(userId, postId, commentsIds) {
      let post = await this.postsService.getPostById(postId);
      if (!post) {
        throw new HttpException('Post no found', 400);
      }
      await this.commentsRepository.deleteComments(userId, post, commentsIds);
    }

}
