import { ApiProperty } from "@nestjs/swagger";

export class MarketPlaceDto {

    @ApiProperty()
    id : string;

    @ApiProperty()
    title : string;

    @ApiProperty()
    description : string;

    @ApiProperty()
    photoUrl : string;

    @ApiProperty()
    price : number;

    @ApiProperty()
    userName : string;

    @ApiProperty()
    userEmail : string;

    @ApiProperty()
    userPhotoUrl : string;

    @ApiProperty()
    userPhoneNumber : string;

    @ApiProperty()
    userLocation : string;

}

export class MarketPlaceFilterDto {
    
    @ApiProperty({ type: "number", required: false })
    limit : number;

    @ApiProperty({ type: "number", required: false })
    offset : number;

    @ApiProperty({ type: "string", required: true, enum: ["en", "pt-BR"] })
    locale : string;

}

export class MarketPlaceByIdDto {
    
    @ApiProperty({ type: "string", required: true })
    id : string;

}