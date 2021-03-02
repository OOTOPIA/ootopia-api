import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../repositories/comments.repository';

@Injectable()
export class CommentsService {

    constructor(private readonly commentsRepository : CommentsRepository) {

    }

    async createComment(commentData) {
      return await this.commentsRepository.createComment(commentData);
    }

    getComments(postId, page) {
      return this.commentsRepository.getCommentsFromPostId(postId, page);
    }

    async deleteComment(postId, commentId) {
      await this.commentsRepository.deleteComment(postId, commentId);
    }

}
