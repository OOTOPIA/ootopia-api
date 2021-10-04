import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SqsMessageHandler } from "@ssut/nestjs-sqs";
import { LearningTracksService } from 'src/learning-tracks/learning-tracks.service';

@Injectable()
export class StrapiWebhookHandlerService {

    constructor(
        private readonly learningTracksService : LearningTracksService){}

    @SqsMessageHandler('strapi_webhook', false)
    public async handleMessage(message: AWS.SQS.Message) {
        try {

            let data : any = JSON.parse(message.Body);

            console.log("Message received at", new Date(), "Message ID:", message.MessageId);

            switch(data.model) {
                case "learning-tracks":
                    if (data.event == "entry.create" || data.event == "entry.update") {
                        await this.createOrUpdateLearningTrack(data.entry);
                    }else if (data.event == "entry.delete") {
                        await this.deleteLearningTrack(data.entry.id);
                    }
                break;
            }

            console.log("Message read successfully at", new Date(), "Message ID:", message.MessageId);

        }catch(err) {
            console.log("SQS 'strapi_webhook' Error:", err);
            throw err;
        }
    }

    async createOrUpdateLearningTrack(entry) {
        console.log("received data from strapi webhook", entry);

        await this.learningTracksService.createOrUpdate(entry);
    }

    async deleteLearningTrack(entryId) {
        await this.learningTracksService.deleteLearningTrack(entryId);
    }

}
