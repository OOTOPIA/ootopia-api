import { HttpException, Injectable } from '@nestjs/common';
import { CreatePostCommentReplyDto } from './dto/create-post-comment-reply.dto';
import { GetPostCommentReplyDto, GetPostCommentReplyParamsDto } from './dto/get-post-comment-reply.dto';
import { UpdatePostCommentReplyDto } from './dto/update-post-comment-reply.dto';
import { PostCommentReplyRepository } from './post-comment.reply.repository';

@Injectable()
export class PostCommentReplyService {
  constructor(
    private readonly postCommentReplyRepository: PostCommentReplyRepository
  ){}
  create(createPostCommentReplyDto: CreatePostCommentReplyDto) {
    return 'This action adds a new postCommentReply';
  }

  findReplyByComment(filter: GetPostCommentReplyDto) {
    let page: GetPostCommentReplyParamsDto = {
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
  
    this.postCommentReplyRepository.PostCommentReply(page);
    return `This action returns all postCommentReply`;
  }

  findOne(id: number) {
    return `This action returns a #${id} postCommentReply`;
  }

  update(id: number, updatePostCommentReplyDto: UpdatePostCommentReplyDto) {
    return `This action updates a #${id} postCommentReply`;
  }

  remove(id: number) {
    return `This action removes a #${id} postCommentReply`;
  }
}
