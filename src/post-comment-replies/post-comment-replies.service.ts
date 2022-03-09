import { HttpException, Injectable } from '@nestjs/common';
import { CreatePostCommentRepliesDto } from './dto/create-post-comment-replies.dto';
import { GetPostCommentRepliesDto, GetPostCommentRepliesParamsDto } from './dto/get-post-comment-replies.dto';
import { PostCommentRepliesRepository } from './post-comment-replies.repository';

@Injectable()
export class PostCommentRepliesService {
  constructor(
    private readonly postCommentRepliesRepository: PostCommentRepliesRepository
  ){}
  create(createPostCommentReply: CreatePostCommentRepliesDto) {
    return this.postCommentRepliesRepository.createCommentReply(createPostCommentReply);
  }

  findRepliesByComment(filter: GetPostCommentRepliesDto) {
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
    console.log('page', page);
    
    return this.postCommentRepliesRepository.findRepliesByComment(page);
  }

  findOne(id: number) {
    return `This action returns a #${id} postCommentReply`;
  }

  update(id: number, updatePostCommentReplyDto) {
    return `This action updates a #${id} postCommentReply`;
  }

  deleteCommentReply(id: string) {
    return this.postCommentRepliesRepository.deleteCommentReply(id);
  }
}
