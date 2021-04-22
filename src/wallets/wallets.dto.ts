import { ApiProperty } from '@nestjs/swagger';

export class WalletsDto {

    @ApiProperty()
    id : string;

    @ApiProperty()
    userId : string;

    @ApiProperty()
    totalBalance : number;

    @ApiProperty()
    createdAt : Date;

    @ApiProperty()
    updatedAt : Date;

}