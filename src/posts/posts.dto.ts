import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PostMetadataDto {

    @ApiProperty({ required: true, enum: ['video', 'image'] })
    type : string;

    @ApiProperty({ required: true, example : "My first awesome post!"})
    description : string;

}

export class CreatePostsDto {

    @ApiProperty({ required: true, type: "file" })
    file : object;

    @ApiProperty({ required: true, type: PostMetadataDto })
    metadata : PostMetadataDto | any;

}

export class PostsTimelineFilterDto {

    @ApiProperty({ required: true, type: "number" })
    page : number;

}

export class CreatedPostDto {

    @ApiProperty({ example: "33e3b1f9-b211-49df-b70b-8fdc1037b8d3" })
    id : string;

    @ApiProperty({ example: "My first awesome post!"})
    description : string;

    @ApiProperty({ enum: ['video', 'image'] })
    type : string;

    @ApiProperty()
    imageUrl : string;

    @ApiProperty()
    videoUrl : string;

    @ApiProperty()
    createdAt : Date;

    @ApiProperty()
    updatedAt : Date;

}

export class PostTimelineDto {

    @ApiProperty({ example: "33e3b1f9-b211-49df-b70b-8fdc1037b8d3" })
    id : string;

    @ApiProperty({ example: "My first awesome post!"})
    description : string;

    @ApiProperty({ enum: ['video', 'image'], example: "video" })
    type : string;

    @ApiProperty()
    imageUrl : string;

    @ApiProperty()
    videoUrl : string;

    @ApiProperty({ description: "Total number of likes" })
    likesCount : number;

    @ApiProperty({ description: "Total number of comments" })
    commentsCount : number;

    @ApiProperty()
    createdAt : Date;

    @ApiProperty()
    updatedAt : Date;

}