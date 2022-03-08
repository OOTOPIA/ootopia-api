import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { CreatedUserDto } from "src/users/users.dto";

export class SearchFriends {
    @ApiProperty({ required: true, example : 1 })
    @IsNotEmpty()
    page : number;

    @ApiProperty({ required: true, example : 50 })
    @IsNotEmpty()
    limit : number;

    @ApiProperty({ enum: ['created', 'name'], default: "created",example: "created" })
    orderBy: string;

    @ApiProperty({ enum: ['asc', 'desc'], default: "asc", example: "asc" })
    sortingType: string;
}

export class SearchNotFriends {
    @ApiProperty({ required: true, example : 0 })
    @IsNotEmpty()
    page : number;

    @ApiProperty({ required: true, example : 100 })
    @IsNotEmpty()
    limit : number;

    @ApiProperty({ required: false})
    name: string;

    @ApiProperty({name: "orderBy", enum: ['created', 'name'], default: "created",example: "created" })
    orderBy: string;

    @ApiProperty({name: "sortingType", enum: ['asc', 'desc'], default: "asc", example: "asc" })
    sortingType: string;
}

export class NonFriendsLookupService {
    @ApiProperty({ required: true, example : 1 })
    @IsNotEmpty()
    page : number;

    @ApiProperty({ required: true, example : 50 })
    @IsNotEmpty()
    limit : number;

    @ApiProperty({ required: false})
    userId: string;

    @ApiProperty({ required: false})
    name: string;

    @ApiProperty({ enum: ['created', 'name'], default: "created",example: "created" })
    orderBy: string;

    @ApiProperty({ enum: ['asc', 'desc'], default: "asc", example: "asc" })
    sortingType: string;
}

export class FriendSearchService {
    @ApiProperty({ required: true, example : 1 })
    @IsNotEmpty()
    page : number;

    @ApiProperty({ required: true, example : 50 })
    @IsNotEmpty()
    limit : number;

    @ApiProperty({ required: false})
    userId: string;

    @ApiProperty({ enum: ['created', 'name'], default: "created",example: "created" })
    orderBy: string;

    @ApiProperty({ enum: ['asc', 'desc'], default: "asc", example: "asc" })
    sortingType: string;
}

export class FriendSearchParameters {
    @ApiProperty({ required: true, example : 1 })
    @IsNotEmpty()
    skip : number;

    @ApiProperty({ required: true, example : 50 })
    @IsNotEmpty()
    limit : number;

    @ApiProperty({ required: false})
    userId: string;

    @ApiProperty({ enum: ['created', 'name'], default: "created",example: "created" })
    orderBy: string;

    @ApiProperty({ enum: ['asc', 'desc'], default: "asc", example: "asc" })
    sortingType: string;

}

export class NonFriendsSearchParameters {
    @ApiProperty({ required: true, example : 1 })
    @IsNotEmpty()
    skip : number;

    @ApiProperty({ required: true, example : 50 })
    @IsNotEmpty()
    limit : number;

    @ApiProperty({ required: false})
    userId: string;

    @ApiProperty({ required: false})
    name: string;

    @ApiProperty({ enum: ['created', 'name'], default: "created",example: "created" })
    orderBy: string;

    @ApiProperty({ enum: ['asc', 'desc'], default: "asc", example: "asc" })
    sortingType: string;
}

export class Friends {
    @ApiProperty({ required: true })
    id: string;
    
    @ApiProperty({ required: true })
    friendId: string;
    
    @ApiProperty({ required: true })
    userId: string;

    @ApiProperty({ required: true })
    createdAt: Date;

    @ApiProperty({ required: true })
    updatedAt: Date;

    @ApiProperty({ required: true, type: CreatedUserDto })
    friend: CreatedUserDto;
}

export class FriendByUser {
    @ApiProperty({ required: true, example : 1 })
    @IsNotEmpty()
    total : number;

    @ApiProperty({ required: true, type: [Friends]})
    @IsNotEmpty()
    friends : [Friends];
}

export class FriendsThumbs {
    @ApiProperty({ required: true, enum: ["video", "image"], example: "image" })
    type: string;

    @ApiProperty({ required: true, example: "https://ootopia-files-staging.s3.sa-east-1.amazonaws.com/users/14d2f918-8194-4b76-b91c-89f111867756/photo-1630932089550.jpg" })
    thumbnailUrl: string;
}

export class FriendsWithPosts {
    @ApiProperty({ nullable : true, type: [FriendsThumbs, FriendsThumbs, FriendsThumbs, FriendsThumbs, FriendsThumbs] })
    friendsThumbs: FriendsThumbs[];

    @ApiProperty({ required: true, example: "d651768b-6c9a-45ef-aa18-1d90b9dcc223" })
    id: string;
    
    @ApiProperty({ required: true, example: "Claudio Fake" })
    fullname: string;
    
    @ApiProperty({ required: true, nullable : true })
    photoUrl: string;

    @ApiProperty({ required: true, example: "2021-04-09T18:02:59.219Z"})
    createdAt: Date;

    @ApiProperty({ required: true ,nullable : true, example: "Claudio Fake" })
    city: string;

    @ApiProperty({ required: true, example: "Claudio Fake" })
    state: string;

    @ApiProperty({ required: true, example: "Claudio Fake" })
    country: string;
    
}
