import { ApiProperty } from "@nestjs/swagger";

export class MarketPlaceDto {

    @ApiProperty()
    id : number;

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
}
