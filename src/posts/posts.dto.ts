import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PostMetadataDto {

    @ApiProperty({ required: true, enum: ['video', 'image'] })
    type : string;

    @ApiProperty({ required: true, example : "My first awesome post!"})
    description : string;

    @ApiProperty()
    tagsIds : string;

    @ApiProperty()
    addressCountryCode : string;

    @ApiProperty()
    addressState : string;
    
    @ApiProperty()
    addressCity : string;

    @ApiProperty()
    addressLatitude : number;

    @ApiProperty()
    addressLongitude : number;

    @ApiProperty()
    addressNumber : number;

}

export class CreatePostsDto {

    @ApiProperty({ required: true, type: "file" })
    file : object;

    @ApiProperty({ required: true, type: PostMetadataDto })
    metadata : PostMetadataDto | any;

}

export class PostsTimelineFilterDto {

    @ApiProperty({ required: false })
    userId : string;

    @ApiProperty({ type: "number", required: false })
    limit : number;

    @ApiProperty({ type: "number", required: false })
    offset : number;

}

export class CreatedPostDto {

    @ApiProperty({ example: "33e3b1f9-b211-49df-b70b-8fdc1037b8d3" })
    id : string;

    @ApiProperty()
    userId : string;

    @ApiProperty({ example: "My first awesome post!"})
    description : string;

    @ApiProperty({ enum: ['video', 'image'] })
    type : string;

    @ApiProperty()
    imageUrl : string;

    @ApiProperty()
    videoUrl : string;

    @ApiProperty()
    streamMediaId : string;

    @ApiProperty()
    videoStatus : string;

    @ApiProperty()
    thumbnailUrl : string;

    @ApiProperty()
    createdAt : Date;

    @ApiProperty()
    updatedAt : Date;

}

export class PostLikeDto {

    @ApiProperty({ example : 10 })
    count : number;

    @ApiProperty({ example : true })
    liked : boolean;

}

export class PostTimelineDto {

    @ApiProperty({ example: "33e3b1f9-b211-49df-b70b-8fdc1037b8d3" })
    id : string;

    @ApiProperty()
    userId : string;

    @ApiProperty({ example: "My first awesome post!"})
    description : string;

    @ApiProperty({ enum: ['video', 'image'], example: "video", description: "Source type of post content" })
    type : string;

    @ApiProperty()
    imageUrl : string;

    @ApiProperty()
    videoUrl : string;

    @ApiProperty()
    thumbnailUrl : string;

    @ApiProperty({ description: "User photo url"})
    photoUrl : string;

    @ApiProperty({ description: "User name"})
    username : string;

    @ApiProperty({ description: "Total number of likes" })
    likesCount : number;

    @ApiProperty({ description: "Total number of comments" })
    commentsCount : number;

    @ApiProperty({ description: "Interests tags", isArray: true })
    tags : string;

    @ApiProperty()
    city : string;

    @ApiProperty()
    state : string;

    @ApiProperty()
    country : string;

    @ApiProperty()
    createdAt : Date;

    @ApiProperty()
    updatedAt : Date;

}

export class CommentDto {

    @ApiProperty({ example: "33e3b1f9-b211-49df-b70b-8fdc1037b8d3" })
    id : string;

    @ApiProperty({ example: "33e3b1f9-b211-49df-b70b-8fdc1037b8d3" })
    userId : string;

    @ApiProperty({ example: "I love it!"})
    message : string;

    @ApiProperty()
    createdAt : Date;

    @ApiProperty()
    updatedAt : Date;

}

export class WebhookDto {

    @ApiProperty()
    uid : string;

    @ApiProperty()
    readyToStream : boolean;

    @ApiProperty()
    status : any;

    @ApiProperty()
    meta : any;

    @ApiProperty()
    created : Date;

    @ApiProperty()
    modified : Date;

}

export class PostVideoWebhookUrl {

    @ApiProperty()
    webhookUrl : string;

}

export class DeleteCommentsDto {

    @ApiProperty()
    commentsIds : string[];

}

export class PostWatchedVideoTimeDto {

    @ApiProperty({ required: true })
    @IsNotEmpty()
    postId : string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    timeInMilliseconds : number;

}

export class PostsWatchedVideosTimeDto {

    @ApiProperty({ required: true, type: PostWatchedVideoTimeDto, isArray: true, description: "The 'data' field must be a string in json array of objects format"})
    @IsNotEmpty()
    data : PostWatchedVideoTimeDto[];

}

export class PostTimelineViewTimeDto {

    @ApiProperty({ required: true })
    @IsNotEmpty()
    timeInMilliseconds : number;

}