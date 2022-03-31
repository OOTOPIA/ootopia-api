import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreatePostCommentRepliesDto {
    
    @ApiProperty({ required: true, example : '87945473-616c-4fe5-bfab-ea9f83155d85' })
    @IsNotEmpty()
    commentId : string;

    @ApiProperty({ required: true, example : 1 })
    @IsNotEmpty()
    text : string;

    @ApiProperty({ required: true, example : '87945473-616c-4fe5-bfab-ea9f83155d85' })
    @IsNotEmpty()
    replyToUserId : string;

    @ApiProperty({ required: false, nullable: true, isArray: true })
    taggedUserIds : string;
}

export class CreatePostCommentRepliesServiceDto {
    
    @ApiProperty({ required: true, example : '87945473-616c-4fe5-bfab-ea9f83155d85' })
    @IsNotEmpty()
    commentId : string;

    @ApiProperty({ required: true, example : 1 })
    @IsNotEmpty()
    text : string;

    @ApiProperty({ required: true, example : '87945473-616c-4fe5-bfab-ea9f83155d85'  })
    @IsNotEmpty()
    replyToUserId : string;

    @ApiProperty({ required: true, example : '87945473-616c-4fe5-bfab-ea9f83155d85' })
    commentUserId : string;

    @ApiProperty({ required: false, nullable: true, isArray: true })
    taggedUserIds: string;
}