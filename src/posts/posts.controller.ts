import { Body, Controller, Get, HttpException, Post, Put, Request, UploadedFile, UseInterceptors, Param, Headers, Query, HttpCode, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { ErrorHandling } from 'src/config/error-handling';
import { CreatePostsDto, CreatedPostDto, PostsTimelineFilterDto, PostTimelineDto, PostLikeDto, WebhookDto, PostVideoWebhookUrl } from './posts.dto';
import { memoryStorage } from 'multer'
import { extname } from 'path'
import { PostsService } from './posts.service';
import { VideoService } from 'src/video/video.service';
import { CommentsFilterDto, CommentsListDto, CreateCommentsDto, CreatedCommentDto } from './comments.dto';
import { CommentsService } from './services/comments.service';

@Controller('posts')
export class PostsController {

    constructor(
        private readonly postsService : PostsService, 
        private readonly videoService : VideoService,
        private readonly commentsService : CommentsService) {}

    @ApiOperation({ summary: 'Upload a video or image post' })
    @ApiBearerAuth()
    @ApiBody({ type: CreatePostsDto })
    @ApiResponse({ status: 201, description: 'The post was created successfully', type : CreatedPostDto })
    @ApiConsumes('multipart/form-data')
    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: memoryStorage(),
    }))
    async createPost(@UploadedFile() file, @Request() req: Request, @Body() post : CreatePostsDto) {
        try {
            
            return await this.postsService.createPost(file.buffer, JSON.parse(post.metadata), '00851c9d-fb60-40b5-8ab2-91bb59bd8163');
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }
    
    @ApiOperation({ summary: 'Like/dislike a post' })
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Successfully registered', type: PostLikeDto })
    @Post('/:id/like')
    @HttpCode(200)
    async likePost(@Request() req: Request, @Param('id') id) {
        try {
            
            return await this.postsService.likePost(id, '00851c9d-fb60-40b5-8ab2-91bb59bd8163');
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @ApiOperation({ summary: 'Returns a list of posts for the timeline' })
    @ApiBearerAuth()
    @ApiQuery({ type : PostsTimelineFilterDto })
    @ApiResponse({ status: 200, type: PostTimelineDto, isArray: true })
    @Get()
    async getPosts(@Request() req: Request, @Query() filters : PostsTimelineFilterDto) {
        try {
            
            /*console.log("file!", file);
            console.log("post!", post.metadata.type);
            console.log("file.buffer", file.buffer);*/

            return await this.postsService.getPostsTimeline(filters, '00851c9d-fb60-40b5-8ab2-91bb59bd8163');
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @ApiOperation({ summary: 'Get details for a specific post' })
    @ApiBearerAuth()
    @ApiResponse({ status: 200, type: PostTimelineDto })
    @Get('/:id')
    async getPostDetails(@Request() req: Request) {
        try {
            
            /*console.log("file!", file);
            console.log("post!", post.metadata.type);
            console.log("file.buffer", file.buffer);*/
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    //TODO: VALIDATE WEBHOOK SIGNATURE

    @ApiExcludeEndpoint()
    @ApiOperation({ summary: 'Receive video status update on Cloudflare' })
    @ApiBearerAuth()
    @ApiBody({ type: WebhookDto })
    @ApiResponse({ status: 200, description: 'The video was processed', type : CreatedPostDto })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Post('/video/webhook')
    async webhook(@Headers() headers, @Body() data: WebhookDto, @Request() req : Request) {
        try {
            console.log("headers", headers);
            //console.log("body", typeof raw, raw);
            let webhookSignature = headers['webhook-signature'];

            if (!webhookSignature) {
                throw new HttpException("UNAUTHORIZED", 401);
            }

            //await this.videoService.validateWebhookSignature(webhookSignature, req.body);

            return await this.postsService.updatePostVideoStatus(data.uid, data.status.state);
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    //TODO: ADICIONAR AUTENTICAÇÃO
    @ApiOperation({ summary: 'Update webhook address called by Cloudflare' })
    @Put('/video/webhook')
    async setWebhookAddress(@Body() data : PostVideoWebhookUrl) {
        try {
            return await this.videoService.setWebhookAddress(data.webhookUrl);
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @ApiOperation({ summary: 'Comment on a post' })
    @ApiBearerAuth()
    @ApiBody({ type: CreateCommentsDto })
    @ApiResponse({ status: 201, description: 'Successfully registered', type: CreatedCommentDto })
    @Post('/:postId/comments')
    async commentPost(@Request() req: Request, @Param('postId') postId, @Body() data) {
        try {
            
            data.postId = postId;
            data.userId = '00851c9d-fb60-40b5-8ab2-91bb59bd8163';

            return await this.commentsService.createComment(data);
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @ApiOperation({ summary: 'Returns a list of comments for the post' })
    @ApiBearerAuth()
    @ApiQuery({ type : CommentsFilterDto })
    @ApiResponse({ status: 200, type: CommentsListDto, isArray: true })
    @Get('/:postId/comments')
    async getComments(@Request() req: Request, @Param('postId') postId, @Query() filters : CommentsFilterDto) {
        try {

            return await this.commentsService.getComments(postId, filters.page);
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @ApiOperation({ summary: 'Remove a comment' })
    @ApiBearerAuth()
    @Delete('/:postId/comments/:commentId')
    async deleteComment(@Request() req: Request, @Param('postId') postId, @Param('commentId') commentId) {
        try {

            return await this.commentsService.deleteComment(postId, commentId);
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }

}
