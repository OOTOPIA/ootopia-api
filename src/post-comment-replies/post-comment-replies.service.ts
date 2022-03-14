import { HttpException, Injectable } from '@nestjs/common';
import { CreatePostCommentRepliesDto, CreatePostCommentRepliesServiceDto } from './dto/create-post-comment-replies.dto';
import { GetPostCommentRepliesDto, GetPostCommentRepliesParamsDto } from './dto/get-post-comment-replies.dto';
import { PostCommentRepliesRepository } from './post-comment-replies.repository';

@Injectable()
export class PostCommentRepliesService {
  constructor(
    private readonly postCommentRepliesRepository: PostCommentRepliesRepository
  ){}
  async create(createPostCommentReply: CreatePostCommentRepliesServiceDto) {
    let createCommentReply = await this.postCommentRepliesRepository.createCommentReply(createPostCommentReply);
    let commentReply = (await this.postCommentRepliesRepository.commentReplyById(createCommentReply.id))[0];
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
    console.log('page', page);
    
    let oi = await this.postCommentRepliesRepository.findRepliesByComment(page);
    console.log(oi);
    
    return oi
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
