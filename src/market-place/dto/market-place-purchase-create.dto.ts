import { ApiProperty } from "@nestjs/swagger";

export class MarketPlacePurchaseCreateDto {
    
    @ApiProperty({ type: "string", description: "Message (optional)" })
    message : string;

}