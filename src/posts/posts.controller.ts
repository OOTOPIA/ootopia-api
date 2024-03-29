import { Body, Controller, Get, HttpException, Post, Put, Request, UploadedFile, UseInterceptors, Param, Headers, Query, HttpCode, Delete, Req, UseGuards, createParamDecorator, Header, Response, HttpService } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiExcludeEndpoint, ApiParam, ApiTags } from '@nestjs/swagger';
import { ErrorHandling } from 'src/config/error-handling';
import { CreatePostsDto, CreatedPostDto, PostsTimelineFilterDto, PostTimelineDto, PostLikeDto, WebhookDto, PostVideoWebhookUrl, DeleteCommentsDto, PostWatchedVideoTimeDto, PostTimelineViewTimeDto, PostsWatchedVideosTimeDto, SendFileDto, CreateFileDto, CreateGalleryDto, ComplaintCreateDTO } from './posts.dto';
import { memoryStorage } from 'multer'
import path, { extname } from 'path'
import { PostsService } from './posts.service';
import { VideoService } from 'src/video/video.service';
import { FilesUploadService } from 'src/files-upload/files-upload.service'
import { CommentsFilterDto, CommentsListDto, CreateCommentsDto, CreatedCommentDto } from './comments.dto';
import { CommentsService } from './services/comments.service';
import { HttpResponseDto } from 'src/config/http-response.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { JwtOptionalAuthGuard } from 'src/auth/jwt-optional-auth.guard';
import { SentryInterceptor } from '../interceptors/sentry.interceptor';
import { PostsWatchedVideotimeService } from './services/posts-watched-videotime.service';
import { PostsTimelineViewTimeService } from './services/posts-timeline-view-time.service';
import { SqsWorkerService } from 'src/sqs-worker/sqs-worker.service';

@Controller('posts')
export class PostsController {

    constructor(
        private readonly postsService : PostsService, 
        private readonly videoService : VideoService,
        private readonly commentsService : CommentsService,
        private readonly filesUploadService: FilesUploadService,
        private readonly postsWatchedVideotimeService : PostsWatchedVideotimeService,
        private readonly postsTimelineViewTimeService : PostsTimelineViewTimeService,
        private readonly sqsWorkerService: SqsWorkerService,
        ) {}

    @UseInterceptors(SentryInterceptor)
    @ApiTags('posts')
    @ApiOperation({ summary: 'Upload a video or image post' })
    @ApiBearerAuth('Bearer')
    @ApiBody({ type: CreatePostsDto })
    @ApiResponse({ status: 201, description: 'The post was created successfully', type : CreatedPostDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @ApiConsumes('multipart/form-data')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file', {
        storage: memoryStorage(),
    }))
    @Post()
    async createPost(@UploadedFile() file, @Req() { user }, @Body() post : CreatePostsDto) {
        try {

            if (!file) {
                throw new HttpException("Video file is not sent", 400);
            }

            return await this.postsService.createPost(file, JSON.parse(post.metadata), user.id);
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }
    @UseInterceptors(SentryInterceptor)
    @ApiTags('posts')
    @ApiOperation({ summary: 'Upload a video or image' })
    @ApiBearerAuth('Bearer')
    @ApiBody({ type: SendFileDto })
    @ApiResponse({ status: 201, description: 'Video or image uploaded successfully', type : CreateFileDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @ApiConsumes('multipart/form-data')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file', {
        storage: memoryStorage(),
    }))
    @Post('/file')
    async sendFile(@UploadedFile() file, @Req() { user }, @Query('type') type: string) {
        try {
            if (!file) {
                throw new HttpException("Video file is not sent", 400);
            }

            return await this.postsService.sendFile(file, user, type);
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('posts')
    @ApiOperation({ summary: 'Create post with multiple files' })
    @ApiBearerAuth('Bearer')
    @ApiBody({ type: CreateGalleryDto })
    @ApiResponse({ status: 201, description: 'Video or Image uploaded successfully', type : CreateGalleryDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @UseGuards(JwtAuthGuard)
    @Post('/gallery')
    async createGallery(@Req() { user }, @Body() post: CreateGalleryDto) {
        try {
            return await this.postsService.createPostGallery(post,user.id);
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('posts')
    @ApiOperation({ summary: 'Like/dislike a post' })
    @ApiBearerAuth('Bearer')
    @ApiParam({name : "id", type: "string", description: "Post ID" })
    @ApiResponse({ status: 200, description: 'Successfully registered', type: PostLikeDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @UseGuards(JwtAuthGuard)
    @Post('/:id/like')
    @HttpCode(200)
    async likePost(@Req() { user }, @Param('id') id) {
        try {
            
            return await this.postsService.likePost(id, user.id);
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('posts')
    @ApiOperation({ summary: 'Returns a list of posts for the timeline' })
    @ApiBearerAuth('Bearer')
    @ApiQuery({ name : "limit", type: "number", description: "Limit of posts (50 max.)", required: false })
    @ApiQuery({ name : "offset", type: "number", required: false })
    @ApiQuery({ name : "locale", type: "enum", enum: ['pt-BR', 'en'], required: false })
    @ApiResponse({ status: 200, type: PostTimelineDto, isArray: true })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @UseGuards(JwtOptionalAuthGuard)
    @Get()
    async getPosts(@Req() req, @Query() filters : PostsTimelineFilterDto) {
        try {

            return await this.postsService.getPostsTimeline(filters, req.user ? req.user.id : null);
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('posts')
    @ApiOperation({ summary: 'Returns a list of posts for the timeline in v2' })
    @ApiBearerAuth('Bearer')
    @ApiQuery({ name : "limit", type: "number", description: "Limit of posts (50 max.)", required: false })
    @ApiQuery({ name : "offset", type: "number", required: false })
    @ApiQuery({ name : "locale", type: "enum", enum: ['pt-BR', 'en'], required: false })
    @ApiResponse({ status: 200, type: PostTimelineDto, isArray: true })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @UseGuards(JwtOptionalAuthGuard)
    @Get('/v2')
    async getPostsV2(@Req() req, @Query() filters : PostsTimelineFilterDto) {
        try {

            return await this.postsService.getPostsTimelineV2(filters, req.user ? req.user.id : null);
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('posts')
    @ApiOperation({ summary: 'Get details for a specific post' })
    @ApiBearerAuth('Bearer')
    @ApiParam({name : "id", type: "string", description: "Post ID" })
    @ApiResponse({ status: 200, type: PostTimelineDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @UseGuards(JwtOptionalAuthGuard)
    @Get('/:id')
    async getPostDetails(@Req() req, @Param('id') id) {
        try {

            let filters = {
                postId : id
            };

            let posts = await this.postsService.getPostsTimeline(filters, req.user ? req.user.id : null);
            
            return posts.length ? posts[0] : null;
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }
    @UseInterceptors(SentryInterceptor)
    @ApiTags('posts')
    @ApiOperation({ summary: 'Get details for a specific post in v2' })
    @ApiBearerAuth('Bearer')
    @ApiParam({name : "id", type: "string", description: "Post ID" })
    @ApiResponse({ status: 200, type: PostTimelineDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @UseGuards(JwtOptionalAuthGuard)
    @Get('/v2/:id')
    async getPostDetailsV2(@Req() req, @Param('id') id) {
        try {

            let filters = {
                postId : id
            };

            let posts = await this.postsService.getPostsTimelineV2(filters, req.user ? req.user.id : null);
            
            return posts.length ? posts[0] : null;
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('posts')
    @ApiOperation({ summary: 'redirect to post or Store' })
    @ApiParam({name : "id" })
    @ApiResponse({ status: 200, type: PostTimelineDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @Header('content-type', 'text/html')
    @HttpCode(200)
    @Get('/shared/:id')
    async getPostShared(@Param('id') id) {
        try {
            return await this.postsService.getPostShareLink(id);
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    
    @UseInterceptors(SentryInterceptor)
    @ApiTags('posts')
    @ApiOperation({ summary: 'redirect to post or Store' })
    @ApiParam({name : "id" })
    @ApiResponse({ status: 200, type: PostTimelineDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @Header('content-type', 'image/jpg')
    @HttpCode(200)
    @Get('/thumbnail-video/:type/:id')
    async geThumbnailVideo(@Param('type') type, @Param('id') id, @Response() res) {
        try {
            res.send( await this.postsService.geThumbnailVideo(type, id))
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('posts')
    @ApiOperation({ summary: 'Remove post' })
    @ApiBearerAuth('Bearer')
    @ApiParam({ name : "postId", type: "string", description: "Post ID" })
    @ApiResponse({ status: 200, description: 'Successfully removed' })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @UseGuards(JwtAuthGuard)
    @Delete('/:postId')
    async deletePost(@Req() { user }, @Param('postId') postId) {
        try {
            return await this.postsService.deletePost(postId, user.id);

        } catch (error) {
            new ErrorHandling(error);
        }
    }

    //TODO: VALIDATE WEBHOOK SIGNATURE

    @UseInterceptors(SentryInterceptor)
    @ApiExcludeEndpoint()
    @ApiOperation({ summary: 'Receive video status update on Cloudflare' })
    @ApiBearerAuth('Bearer')
    @ApiBody({ type: WebhookDto })
    @ApiResponse({ status: 200, description: 'The video was processed', type : CreatedPostDto })
    @ApiResponse({ status: 401, description: 'Unauthorized', type: HttpResponseDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @Post('/video/webhook')
    async webhook(@Headers() headers, @Body() data: WebhookDto, @Request() req : Request) {
        try {
            const webhookSignature = headers['webhook-signature'];

            if (!webhookSignature) {
                throw new HttpException("UNAUTHORIZED", 401);
            }

            //await this.videoService.validateWebhookSignature(webhookSignature, req.body);
            await this.sqsWorkerService.sendUpdatePostVideoStatusMessage({streamMediaId: data.uid, status: data.status.state, duration: data.duration});
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    //TODO: ADICIONAR AUTENTICAÇÃO
    @UseInterceptors(SentryInterceptor)
    @ApiTags('posts')
    @ApiOperation({ summary: 'Update webhook address called by Cloudflare' })
    @Put('/video/webhook')
    async setWebhookAddress(@Body() data : PostVideoWebhookUrl) {
        try {
            return await this.videoService.setWebhookAddress(data.webhookUrl);
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('posts')
    @ApiOperation({ summary: 'Comment on a post' })
    @ApiBearerAuth('Bearer')
    @ApiParam({ name : "postId", type: "string", description: "Post ID" })
    @ApiBody({ type: CreateCommentsDto })
    @ApiResponse({ status: 201, description: 'Successfully registered', type: CreatedCommentDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @UseGuards(JwtAuthGuard)
    @Post('/:postId/comments')
    async commentPost(@Req() { user }, @Param('postId') postId, @Body() data) {
        try {

            data.postId = postId;
            data.userId = user.id;

            return await this.commentsService.createComment(data);
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('posts')
    @ApiOperation({ summary: 'Returns a list of comments for the post' })
    @ApiBearerAuth('Bearer')
    @ApiParam({ name : "postId", type: "string", description: "Post ID" })
    @ApiQuery({ name : "page", type: "number", description: "Current Page" })
    @ApiResponse({ status: 200, type: CommentsListDto, isArray: true })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @Get('/:postId/comments')
    async getComments(@Request() req: Request, @Param('postId') postId, @Query() filters : CommentsFilterDto) {
        try {

            return this.commentsService.getComments(postId, filters.page);
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('posts')
    @ApiOperation({ summary: 'Remove one or more comments' })
    @ApiBearerAuth('Bearer')
    @ApiBody({ type: DeleteCommentsDto })
    @ApiParam({ name : "postId", type: "string", description: "Post ID" })
    @ApiResponse({ status: 200, description: 'Successfully removed' })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @UseGuards(JwtAuthGuard)
    @Delete('/:postId/comments')
    async deleteComment(@Req() { user }, @Param('postId') postId, @Body() body : DeleteCommentsDto) {
        try {

            return await this.commentsService.deleteComments(user.id, postId, body.commentsIds);
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('posts')
    @ApiOperation({ summary: 'Record watched video time for a lot of posts' })
    @ApiBearerAuth('Bearer')
    @ApiBody({ type: PostsWatchedVideosTimeDto })
    @ApiResponse({ status: 201, description: 'Successfully registered' })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @UseGuards(JwtAuthGuard)
    @Post('/watched')
    async recordWatchedVideoTime(@Req() { user }, @Body() body) {
        try {

            await this.postsWatchedVideotimeService.recordWatchedVideotime(user.id, JSON.parse(body.data));
            return;
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('posts')
    @ApiOperation({ summary: 'Record posts timeline view time' })
    @ApiBearerAuth('Bearer')
    @ApiBody({ type: PostTimelineViewTimeDto })
    @ApiResponse({ status: 201, description: 'Successfully registered' })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @UseGuards(JwtAuthGuard)
    @Post('/timeline-watched')
    async recordPostsTimelineViewTime(@Req() { user }, @Body() data) {
        try {

            data.userId = user.id;

            return await this.postsTimelineViewTimeService.recordTimelineViewTime(data);
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('posts')
    @ApiOperation({ summary: 'Create Complaint post' })
    @ApiBearerAuth('Bearer')
    @ApiBody({ type: ComplaintCreateDTO })
    @ApiResponse({ status: 201, description: 'Successfully Denounced' })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @UseGuards(JwtAuthGuard)
    @Post('/complaint')
    async complaint(@Req() { user }, @Body() data: ComplaintCreateDTO) {
        try {
            return await this.postsService.createComplaint({userId: user.id, ...data})
        
        } catch (error) {
            new ErrorHandling(error);
        }
    }

}
