import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCommentsDto {

    @ApiProperty({ required: true, type: "string" })
    text : string;
    
    @ApiProperty({ required: false })
    taggedUser: string[]; 

}

export class CreatedCommentDto {

    @ApiProperty({ example: "33e3b1f9-b211-49df-b70b-8fdc1037b8d3" })
    id : string;

    @ApiProperty()
    postId : string;

    @ApiProperty()
    userId : string;

    @ApiProperty({ example: "I love it!" })
    text : string;

    @ApiProperty()
    deleted : boolean;

    @ApiProperty()
    createdAt : Date;

    @ApiProperty()
    updatedAt : Date;

}

export class CommentsFilterDto {

    @ApiProperty({ type: "number", default: 1, minimum: 1, name: "page" })
    page : number;

}

export class CommentsListDto {

    @ApiProperty({ example: "33e3b1f9-b211-49df-b70b-8fdc1037b8d3" })
    id : string;

    @ApiProperty()
    postId : string;

    @ApiProperty()
    userId : string;

    @ApiProperty({ example: "I love it!"})
    text : string;

    @ApiProperty({ description: "User photo url"})
    photoUrl : string;

    @ApiProperty({ description: "User name"})
    username : string;

    @ApiProperty()
    createdAt : Date;

    @ApiProperty()
    totalReplies: number;

    @ApiProperty()
    taggedUser: any;

    @ApiProperty()
    updatedAt : Date;

}