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
    usersName?: string[];

    @ApiProperty()
    postId?: string;

    @ApiProperty()
    commentId?: string;

    @ApiProperty()
    usersId?: string;
    
    @ApiProperty()
    photoUrl?: string;
    
    @ApiProperty()
    oozAmount?:  string;
}

class Notification {
    @ApiProperty()
    title: string;

    @ApiProperty()
    body: string;

    @ApiProperty()
    imageUrl: string;
}

export class NotificationMessageDTO {
    @ApiProperty({ required: true, type: "string" })
    token: string;

    @ApiProperty()
    notification?: Notification;

    @ApiProperty()
    data: NotificationDataDTO;

    @ApiProperty({required: false})
    android?: Android;
}
