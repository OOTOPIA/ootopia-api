import { Controller, Get, Post, Body, Put, Param, Delete, UseInterceptors, UseGuards, Query, Req } from '@nestjs/common';
import { PostCommentRepliesService } from './post-comment-replies.service';
import { CreatePostCommentRepliesDto } from './dto/create-post-comment-replies.dto';
import { SentryInterceptor } from 'src/interceptors/sentry.interceptor';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HttpResponseDto } from 'src/config/http-response.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetPostCommentRepliesDto } from './dto/get-post-comment-replies.dto';
import { PostCommentReplyDto } from './dto/post-comment-replies.dto';

@Controller('post-comment-replies')
export class PostCommentRepliesController {
  constructor(private readonly postCommentReplyService: PostCommentRepliesService) {}

  @UseInterceptors(SentryInterceptor)
  @ApiTags('comment-reply')
  @ApiBearerAuth('Bearer')
  @ApiOperation({ summary: 'Save reply' })
  @ApiResponse({ status: 200, description: 'Save success', type: PostCommentReplyDto})
  @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
  @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() { user },@Body() createPostCommentReplyDto: CreatePostCommentRepliesDto) {
    return this.postCommentReplyService.create({...createPostCommentReplyDto, commentUserId: user.id});
  }

  @UseInterceptors(SentryInterceptor)
  @ApiTags('comment-reply')
  @ApiOperation({ summary: 'List all comment-reply' })
  @ApiResponse({ status: 200, description: 'Successfully List', type: [PostCommentReplyDto]})
  @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
  @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
  @Get()
  findReplysByComment(
      @Query() filter: GetPostCommentRepliesDto
  ) {
      return this.postCommentReplyService.findRepliesByComment(filter);
  }

  @UseInterceptors(SentryInterceptor)
  @ApiTags('comment-reply')
  @ApiBearerAuth('Bearer')
  @ApiResponse({ status: 200, description: 'deleted success', type: [PostCommentReplyDto]})
  @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
  @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postCommentReplyService.deleteCommentReply(id);
  }
}
