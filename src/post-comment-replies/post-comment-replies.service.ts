import { HttpException, Injectable } from '@nestjs/common';
import { NotificationMessagesService } from 'src/notification-messages/notification-messages.service';
import { PostsService } from 'src/posts/posts.service';
import { CommentsService } from 'src/posts/services/comments.service';
import { UsersDeviceTokenService } from 'src/users-device-token/users-device-token.service';
import { UsersService } from 'src/users/users.service';
import { CreatePostCommentRepliesServiceDto } from './dto/create-post-comment-replies.dto';
import { GetPostCommentRepliesDto, GetPostCommentRepliesParamsDto } from './dto/get-post-comment-replies.dto';
import { PostCommentRepliesRepository } from './post-comment-replies.repository';

@Injectable()
export class PostCommentRepliesService {
  constructor(
    private readonly postCommentRepliesRepository: PostCommentRepliesRepository,
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
    private readonly usersDeviceTokenService: UsersDeviceTokenService,
    private readonly notificationMessagesService: NotificationMessagesService,
    private readonly commentsService: CommentsService,
  ){}

  async create(createPostCommentReply: CreatePostCommentRepliesServiceDto) {
    let createCommentReply = await this.postCommentRepliesRepository.createCommentReply(createPostCommentReply);

    let commentReply = (await this.postCommentRepliesRepository.commentReplyById(createCommentReply.id))[0];

    let comment = await this.commentsService.getCommentById(commentReply.commentId);

    // unique ids
    commentReply.taggedUserIds = [...new Set(commentReply.taggedUserIds)]
      .filter( _ids => _ids != commentReply.commentUserId && _ids != commentReply.replyToUserId);
    
    let [post, userComment, usersTokenReply, usersTokenTagged] = await Promise.all([
      this.postsService.getPostById(<any>comment.postId),
      this.usersService.getUserById(<any>commentReply.commentUserId),
      this.usersDeviceTokenService.getByUsersId(commentReply.replyToUserId),
      this.usersDeviceTokenService.getByUsersId(commentReply.taggedUserIds),
    ]);

    let notifications = []; 
    if(commentReply.replyToUserId && commentReply.replyToUserId != commentReply.commentUserI) {
        notifications = usersTokenReply.filter( user => !!user).map( (user: any) => 
        ({
          token: user.deviceToken,
          data: {
            type: "user-tagged-in-comment-reply",
            postId: post.id,
            photoUrl : post.thumbnailUrl,
            commentId : commentReply.commentId,
            usersName: <any>JSON.stringify([userComment.fullname]),
          }
        })
      );
    }

    notifications = notifications.concat(
      usersTokenTagged.filter( user => !!user)
      .map( (user: any) => 
        ({
          token: user.deviceToken,
          data: {
            type: "user-tagged-in-comment",
            postId: post.id,
            photoUrl : post.thumbnailUrl,
            commentId : commentReply.commentId,
            usersName: <any>JSON.stringify([userComment.fullname])
          }
        })
      ));
    
    if (notifications.length) {
      await this.notificationMessagesService.sendFirebaseMessages(notifications);
    }
    
    return commentReply;
  }

  async findRepliesByComment(filter: GetPostCommentRepliesDto) {
    let page: GetPostCommentRepliesParamsDto = {
      commentId: filter.commentId,
      limit: +filter.limit,
      skip: +filter.limit * +filter.page,
    };
    page.limit = page.limit > 100 ? 100 : page.limit;

    if (page.skip < 0 || (page.skip == 0 && page.limit == 0)) {
        throw new HttpException(
            {
              status: 404,
              error: "Page not found",
            },
            404
        );
    }
    
    return  this.postCommentRepliesRepository.findRepliesByComment(page);
  }

  deleteCommentReply(id: string) {
    return this.postCommentRepliesRepository.deleteCommentReply(id);
  }
}
