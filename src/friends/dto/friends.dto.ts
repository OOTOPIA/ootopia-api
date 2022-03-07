import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { CreatedUserDto } from "src/users/users.dto";

export class FriendRequestPagingByUser {
    @ApiProperty({ required: true, example : 1 })
    @IsNotEmpty()
    page : number;

    @ApiProperty({ required: true, example : 50 })
    @IsNotEmpty()
    limit : number;

    @ApiProperty({ required: false})
    name: string;
}

export class ServiceFriendPagingByUser {
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
}

export class FriendPagingByUser {
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