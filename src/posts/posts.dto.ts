import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PostMetadataDto {

    @ApiProperty({ required: true, enum: ['image', 'video'] })
    type : string;

    @ApiProperty({ required: true, example : "My first awesome post!"})
    description : string;

}

export class CreatePostsDto {

    @ApiProperty({ required: true, type: "file" })
    file : object;

    @ApiProperty({ required: true, type : PostMetadataDto })
    metadata : PostMetadataDto | any;

}