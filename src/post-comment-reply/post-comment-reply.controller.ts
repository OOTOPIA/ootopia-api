import { Controller, Get, Post, Body, Put, Param, Delete, UseInterceptors, UseGuards, Query } from '@nestjs/common';
import { PostCommentReplyService } from './post-comment-reply.service';
import { CreatePostCommentReplyDto } from './dto/create-post-comment-reply.dto';
import { UpdatePostCommentReplyDto } from './dto/update-post-comment-reply.dto';
import { SentryInterceptor } from 'src/interceptors/sentry.interceptor';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HttpResponseDto } from 'src/config/http-response.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetPostCommentReplyDto } from './dto/get-post-comment-reply.dto';

@Controller('post-comment-reply')
export class PostCommentReplyController {
  constructor(private readonly postCommentReplyService: PostCommentReplyService) {}

  @Post()
  create(@Body() createPostCommentReplyDto: CreatePostCommentReplyDto) {
    return this.postCommentReplyService.create(createPostCommentReplyDto);
  }

  @UseInterceptors(SentryInterceptor)
  @ApiTags('friends')
  @ApiBearerAuth('Bearer')
  @ApiOperation({ summary: 'List all friends of user' })
  @ApiResponse({ status: 200, description: 'Successfully List' })
  @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
  @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
  @UseGuards(JwtAuthGuard)
  @Get()
  async searchFriends(
      @Query() filter: GetPostCommentReplyDto
  ) {
      return await this.postCommentReplyService.findReplyByComment(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postCommentReplyService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePostCommentReplyDto: UpdatePostCommentReplyDto) {
    return this.postCommentReplyService.update(+id, updatePostCommentReplyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postCommentReplyService.remove(+id);
  }
}
