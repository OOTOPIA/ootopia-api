import { Body, Controller, Get, HttpException, Post, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ErrorHandling } from 'src/config/error-handling';
import { CreatePostsDto, CreatedPostDto, PostsTimelineFilterDto, PostTimelineDto } from './posts.dto';
import { memoryStorage } from 'multer'
import { extname } from 'path'
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {

    constructor(private readonly postsService : PostsService) {

    }

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
            
            console.log("file!", file);
            console.log("post!", JSON.parse(post.metadata));
            console.log("file.buffer", file.buffer);

            //throw new Error("");
            //throw { message : "aed"};

            return this.postsService.createPost(file.buffer, JSON.parse(post.metadata));
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }
    
    @ApiOperation({ summary: 'Like a post' })
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Successfully registered' })
    @Post('/:id/like')
    async likePost(@Request() req: Request) {
        try {
            
            /*console.log("file!", file);
            console.log("post!", post.metadata.type);
            console.log("file.buffer", file.buffer);*/
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @ApiOperation({ summary: 'Dislike a post' })
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Successfully registered' })
    @Post('/:id/dislike')
    async dislikePost(@Request() req: Request) {
        try {
            
            /*console.log("file!", file);
            console.log("post!", post.metadata.type);
            console.log("file.buffer", file.buffer);*/
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @ApiOperation({ summary: 'Returns a list of posts for the timeline' })
    @ApiBearerAuth()
    @ApiQuery({ type : PostsTimelineFilterDto })
    @ApiResponse({ status: 200, type: PostTimelineDto, isArray: true })
    @Get()
    async getPosts(@Request() req: Request) {
        try {
            
            /*console.log("file!", file);
            console.log("post!", post.metadata.type);
            console.log("file.buffer", file.buffer);*/
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }

}
