import { HttpException, Injectable } from '@nestjs/common';
import { PostsService } from '../posts.service';
import { CommentsRepository } from '../repositories/comments.repository';

@Injectable()
export class CommentsService {

    constructor(private readonly commentsRepository : CommentsRepository, private readonly postsService : PostsService) {

    }

    async createComment(commentData) {
      return await this.commentsRepository.createComment(commentData);
    }

    getComments(postId, page) {
      return this.commentsRepository.getCommentsFromPostId(postId, page);
    }

    async deleteComments(userId, postId, commentsIds) {
      let post = await this.postsService.getPostById(postId);
      if (!post) {
        throw new HttpException('Post no found', 400);
      }
      await this.commentsRepository.deleteComments(userId, post, commentsIds);
    }

}
