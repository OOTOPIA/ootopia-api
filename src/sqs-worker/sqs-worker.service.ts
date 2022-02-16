import { Injectable } from '@nestjs/common';
import { SqsService } from '@ssut/nestjs-sqs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SqsWorkerService {

    public constructor(
        private readonly sqsService: SqsService,
    ) {}
  
    public async sendDailyGoalUsersIdsMessage(data : { usersIds : string[] }) {
        return await this.sqsService.send('daily_goal_distribution', {
            id: uuidv4(),
            body: data,
            delaySeconds: 0,
        });
    }

    public async sendStrapiWebhookMessage(data : any) {
        return await this.sqsService.send('strapi_webhook', {
            id: uuidv4(),
            body: data,
            delaySeconds: 0,
        });
    }

    public async sendUpdatePostVideoStatusMessage(
        data : {
            streamMediaId: string,
            status: string,
        }
    ) {
        return await this.sqsService.send('update-post-video-status', {
            id: uuidv4(),
            body: data,
            delaySeconds: 0,
        });
    }
}
