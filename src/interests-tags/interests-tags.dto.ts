import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class InterestsTagsDto {

    @ApiProperty({ example: "33e3b1f9-b211-49df-b70b-8fdc1037b8d3" })
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty({ enum: ['top', 'secondary'], example: "top" })
    type: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

}


export class FilterInterestsTagsDto {

    @ApiProperty({ example: ["pt-BR", "en-US"], default: "pt-BR" })
    language: string;

}
export class CreateTagDto {

    @ApiProperty()
    name: string;

    @ApiProperty({ example: ["pt-BR", "en-US"], default: "pt-BR" })
    language: string;

}

export class FilterSearchHashtagDto {
    @ApiProperty({ required: false })
    name?: string;
    @ApiProperty({ example: ["pt-BR", "en-US"], default: "pt-BR", required: false })
    language?: string;
    
    @ApiProperty({ required: true, example : 1 })
    @IsNotEmpty()
    page : number;

    @ApiProperty({ required: true, example : 50 })
    @IsNotEmpty()
    limit : number;
}