import { ApiProperty } from "@nestjs/swagger";

export class CreateUsersDeviceTokenDto {}

export class DeviceTokenDTO {

    @ApiProperty({ required: true })
    deviceToken : string;

    @ApiProperty({ required: true })
    deviceId : string;
}
