import { isEmpty, isNotEmpty, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class Android {
    @ApiProperty()
    priority: String;

    @ApiProperty()
    ttl: number;
}

export class NotificationDTO {
    @ApiProperty()
    title: String;

    @ApiProperty()
    body: String;
    
}

export class NotificationMessageDTO {
    @ApiProperty({ required: true, type: "string" })
    token: String;

    @ApiProperty()
    notification: NotificationDTO;

    @ApiProperty({required: false})
    android: Android;
}
