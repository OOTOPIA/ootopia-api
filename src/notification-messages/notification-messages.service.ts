import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Messaging } from 'firebase-admin/lib/messaging/messaging';
import { Message } from 'firebase-admin/lib/messaging/messaging-api';
import { NotificationMessageDTO } from './notification-messages.dto'


@Injectable()
export class NotificationMessagesService {

    async sendFirebaseMessage (messages) {
        const android :any = {
            priority: "high",
            ttl: 60 * 60 * 24 * 1000,
            }
        
            messages.forEach( message => message.android = android);
    

        return admin.messaging().sendAll(<any>messages);
    }
}
