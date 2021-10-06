import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SqsMessageHandler } from "@ssut/nestjs-sqs";
import { LearningTracksService } from 'src/learning-tracks/learning-tracks.service';
import { MarketPlaceService } from 'src/market-place/market-place.service';

@Injectable()
export class StrapiWebhookHandlerService {

    constructor(
        private readonly learningTracksService : LearningTracksService,
        private readonly marketPlaceService : MarketPlaceService
    ){}

    @SqsMessageHandler('strapi_webhook', false)
    public async handleMessage(message: AWS.SQS.Message) {
        try {

            let data : any = JSON.parse(message.Body);

            switch(data.model) {
                case "learning-tracks":
                    if (data.event == "entry.publish" || data.event == "entry.update") {
                        await this.createOrUpdateLearningTrack(data.entry, data.event);
                    }else if (data.event == "entry.delete" || data.event == "entry.unpublish") {
                        await this.deleteLearningTrack(data.entry.id);
                    }
                break;
                case "market-place":
                    if (data.event == "entry.publish" || data.event == "entry.update") {
                        await this.createOrUpdateMarketPlaces(data.entry, data.event);
                    }else if (data.event == "entry.delete" || data.event == "entry.unpublish") {
                        await this.deleteMarketPlaces(data.entry.id);
                    }
                break;
            }

        }catch(err) {
            throw err;
        }
    }

    async createOrUpdateLearningTrack(entry, event : string) {
        await this.learningTracksService.createOrUpdate(entry, event);
    }

    async deleteLearningTrack(entryId) {
        await this.learningTracksService.deleteLearningTrack(entryId);
    }

    async createOrUpdateMarketPlaces(entry, event : string) {
        await this.marketPlaceService.createOrUpdate(entry, event);
    }

    async deleteMarketPlaces(entryId) {
        await this.marketPlaceService.deleteMarketPlaces(entryId);
    }

}
