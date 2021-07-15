import { Injectable } from '@nestjs/common';
import { SqsMessageHandler } from "@ssut/nestjs-sqs";

@Injectable()
export class DailyGoalDistributionHandlerService {

    @SqsMessageHandler('daily_goal_distribution', false)
    public async handleMessage(message: AWS.SQS.Message) {
        try {

            let data = JSON.parse(message.Body);

            console.log(">>> daily_goal_distribution", data);

        }catch(err) {
            console.log("SQS 'daily_goal_distribution' Error:", err);
        }
    }

}
