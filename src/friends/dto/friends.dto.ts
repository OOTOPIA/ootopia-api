import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class FriendRequestPagingByUser {
    @ApiProperty({ required: true, example : 1 })
    @IsNotEmpty()
    page : number;

    @ApiProperty({ required: true, example : 50 })
    @IsNotEmpty()
    limit : number;
}

export class FriendPagingByUser {
    @ApiProperty({ required: true, example : 1 })
    @IsNotEmpty()
    skip : number;

    @ApiProperty({ required: true, example : 50 })
    @IsNotEmpty()
    limit : number;
}