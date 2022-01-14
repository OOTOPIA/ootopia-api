import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateUsersDeviceTokenDto {}

export class DeviceTokenDTO {

    @ApiProperty({ required: true })
    @IsNotEmpty()
    deviceToken : string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    deviceId : string;
}
