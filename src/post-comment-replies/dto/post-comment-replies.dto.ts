import { ApiProperty } from "@nestjs/swagger";

export class PostCommentReplyDto {
    
    @ApiProperty({ required: true, nullable: false, example : '87945473-616c-4fe5-bfab-ea9f83155d85' })
    id : string;

    @ApiProperty({ required: true, nullable: false, example : '87945473-616c-4fe5-bfab-ea9f83155d85' })
    commentId : string;

    @ApiProperty({ required: true, nullable: false, example : "test comment" })
    text : string;

    @ApiProperty({ required: true, nullable: false, example : '87945473-616c-4fe5-bfab-ea9f83155d85' })
    commentUserId : string;

    @ApiProperty({ required: false, nullable: true, isArray: true })
    taggedUserIds : string;
}