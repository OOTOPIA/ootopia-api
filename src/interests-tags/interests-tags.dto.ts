import { ApiProperty } from '@nestjs/swagger';

export class InterestsTagsDto {

    @ApiProperty({ example: "33e3b1f9-b211-49df-b70b-8fdc1037b8d3" })
    id : string;

    @ApiProperty()
    name : string;

    @ApiProperty({ enum: ['top', 'secondary'], example: "top" })
    type : string;

    @ApiProperty()
    createdAt : Date;

    @ApiProperty()
    updatedAt : Date;

}


export class FilterInterestsTagsDto {

    @ApiProperty({example: ["pt-BR", "en-US"], default: "pt-BR"})
    language : string;

}