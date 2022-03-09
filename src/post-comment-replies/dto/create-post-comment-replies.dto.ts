import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreatePostCommentRepliesDto {
    
    @ApiProperty({ required: true, example : '87945473-616c-4fe5-bfab-ea9f83155d85' })
    @IsNotEmpty()
    commentId : string;

    @ApiProperty({ required: true, example : 1 })
    @IsNotEmpty()
    text : string;

    @ApiProperty({ required: false, nullable: true, isArray: true })
    taggedUser : string;
}
