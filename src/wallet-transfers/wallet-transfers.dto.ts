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

export class WalletTransfersHistoryDto {

    @ApiProperty({ example: "33e3b1f9-b211-49df-b70b-8fdc1037b8d3" })
    id : string;

    @ApiProperty()
    userId : string;

    @ApiProperty()
    walletId : string;

    @ApiProperty({ description: "ID of the other user related to the transaction, if any. Applicable to display the user's name on incoming transfers" })
    otherUserId : string;

    @ApiProperty({ description: "Name of the other user related to the transaction, if any. Applicable to display the user's name on incoming transfers" })
    otherUsername : string;

    @ApiProperty({ enum: ['video_view', 'video_like', 'transfer'], description: "Identifier of the origin of the transfer. In cases of transfer received through a like, video viewing etc." })
    origin : string;

    @ApiProperty({ enum: ['sent', 'received'] })
    action : string;

    @ApiProperty()
    balance : number;

    @ApiProperty()
    createdAt : Date;

    @ApiProperty()
    updatedAt : Date;

}

export class WalletTransferToPostDto {

    @ApiProperty()
    balance : number;

    @ApiProperty()
    dontAskAgainToConfirmGratitudeReward : boolean;

}

export class WalletTransfersFilterDto {

    @ApiProperty({ enum: ['sent', 'received'] })
    action : string;

    @ApiProperty({ type: "number", required: false })
    limit : number;

    @ApiProperty({ type: "number", required: false })
    offset : number;

}