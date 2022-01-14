import { isEmpty, isNotEmpty, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class Android {
    @ApiProperty()
    priority: string;

    @ApiProperty()
    ttl: number;
}

export class NotificationDataDTO {
    @ApiProperty()
    type: string;

    @ApiProperty()
    usersName: string[];

    @ApiProperty()
    postId: string;

    @ApiProperty()
    photoUrl: string;
    
    @ApiProperty()
    oozAmount?:  string;
}

export class NotificationMessageDTO {
    @ApiProperty({ required: true, type: "string" })
    token: string;

    @ApiProperty()
    data: NotificationDataDTO;

    @ApiProperty({required: false})
    android?: Android;
}
