import { ApiProperty } from '@nestjs/swagger';

export class WalletTransfersDto {

    @ApiProperty()
    id : string;

    @ApiProperty()
    walletId : string;

    @ApiProperty()
    userId : string;

    @ApiProperty()
    balance : number;

    @ApiProperty()
    createdAt : Date;

    @ApiProperty()
    updatedAt : Date;

}