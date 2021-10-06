import { Injectable } from '@nestjs/common';
import { SqsWorkerService } from 'src/sqs-worker/sqs-worker.service';

@Injectable()
export class StrapiService {

    constructor(
        private readonly sqsWorkerService : SqsWorkerService,
    ){};

    async webhook(data) {
        console.log(data,'kole');
        
        if (!data) {
            return;
        }

        switch(data.model) {
            case "learning-tracks":
                if (data.event == "entry.publish" || data.event == "entry.update" || data.event == "entry.delete" || data.event == "entry.unpublish") {
                    await this.sqsWorkerService.sendStrapiWebhookMessage(data);
                }
            break;
            case "market-place":
                if (data.event == "entry.publish" || data.event == "entry.update" || data.event == "entry.delete" || data.event == "entry.unpublish") {
                    console.log('chegou aqui no minimo ?');
                    
                    await this.sqsWorkerService.sendStrapiWebhookMessage(data);
                }
            break;
        }

        return { "status" : "success" };

    }

}
