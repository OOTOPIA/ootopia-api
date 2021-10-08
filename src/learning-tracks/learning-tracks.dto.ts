import { ApiProperty } from '@nestjs/swagger';
import { isArray } from 'class-validator';


export class ChapterDto {

    @ApiProperty()
    id : number;

    @ApiProperty()
    title : string;

    @ApiProperty()
    videoUrl : string;

    @ApiProperty()
    videoThumbUrl : string;

    @ApiProperty()
    time : string;

    @ApiProperty()
    ooz : number;

    @ApiProperty()
    completed : boolean;

    @ApiProperty()
    createdAt : Date;

    @ApiProperty()
    updatedAt : Date;

}

export class LearningTrackDto {

    @ApiProperty()
    id : number;

    @ApiProperty()
    userPhotoUrl : string;

    @ApiProperty()
    userName : string;

    @ApiProperty()
    title : string;

    @ApiProperty()
    description : string;

    @ApiProperty()
    imageUrl : string;

    @ApiProperty()
    ooz : number;

    @ApiProperty()
    totalTimeInMinutes : number;

    @ApiProperty()
    location? : string;

    @ApiProperty({isArray : true, type: ChapterDto})
    chapters : ChapterDto;

    @ApiProperty()
    createdAt : Date;

    @ApiProperty()
    updatedAt : Date;

}

export class LearningTracksFilterDto {

    @ApiProperty({ type: "string", required: true, enum: ["en", "pt-BR"] })
    locale : string;

    @ApiProperty({ type: "number", required: false })
    limit? : number;

    @ApiProperty({ type: "number", required: false })
    offset? : number;

}

export class LastLearningTracksFilterDto {

    @ApiProperty({ type: "string", required: true, enum: ["en", "pt-BR"] })
    locale : string;

}