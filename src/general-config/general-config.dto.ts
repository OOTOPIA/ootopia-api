import { ApiProperty } from '@nestjs/swagger';

export class GeneralConfigDto {

    @ApiProperty()
    name : string;

    @ApiProperty()
    value : any;

}

export class GeneralConfigIosHasNotchDto {

    @ApiProperty()
    iosScreenSize : number;

}