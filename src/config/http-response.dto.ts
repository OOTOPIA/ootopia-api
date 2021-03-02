import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class HttpResponseDto {

    @ApiProperty()
    status : number;

    @ApiProperty()
    error : string;

}
