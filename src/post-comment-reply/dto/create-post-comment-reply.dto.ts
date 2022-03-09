import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreatePostCommentReplyDto {
    
    @ApiProperty({ required: true, example : '87945473-616c-4fe5-bfab-ea9f83155d85' })
    commentId : string;

    @ApiProperty({ required: true, example : 1 })
    @IsNotEmpty()
    page : number;

    @ApiProperty({ required: true, example : 50 })
    @IsNotEmpty()
    limit : number;
}
