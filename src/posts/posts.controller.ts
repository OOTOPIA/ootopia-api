import { Body, Controller, HttpException, Post, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { ErrorHandling } from 'src/config/error-handling';
import { CreatePostsDto } from './posts.dto';
import { memoryStorage } from 'multer'
import { extname } from 'path'
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {

    constructor(private readonly postsService : PostsService) {

    }

    @ApiOperation({ summary: 'Upload a video or image post' })
    @ApiBody({ type: CreatePostsDto })
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

            return this.postsService.createPost(file.buffer, JSON.parse(post.metadata));
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    
    @ApiOperation({ summary: 'Like a post' })
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

}
