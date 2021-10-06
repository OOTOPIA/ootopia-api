import { ApiProperty } from "@nestjs/swagger";

export class MarketPlacePurchaseCreatedDto {
    
    @ApiProperty({ type: "string", description: "Wallet Transfer ID" })
    id : string;

}