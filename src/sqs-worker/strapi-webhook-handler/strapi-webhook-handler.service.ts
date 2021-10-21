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
                        if (!data.entry.push) {
                            data.entry = [data.entry];
                        }
                        for (let i = 0; i < data.entry.length; i++) {
                            let entry = data.entry[i];
                            await this.createOrUpdateLearningTrack(entry, data.event);
                        }
                    }else if (data.event == "entry.delete" || data.event == "entry.unpublish") {
                        if (!data.entry.push) {
                            data.entry = [data.entry];
                        }
                        for (let i = 0; i < data.entry.length; i++) {
                            let entry = data.entry[i];
                            await this.deleteLearningTrack(entry.id);
                        }
                    }
                break;
                case "market-place":
                    if (data.event == "entry.publish" || data.event == "entry.update") {
                        if (!data.entry.push) {
                            data.entry = [data.entry];
                        }
                        for (let i = 0; i < data.entry.length; i++) {
                            let entry = data.entry[i];
                            await this.createOrUpdateMarketPlaces(entry, data.event);
                        }
                    }else if (data.event == "entry.delete" || data.event == "entry.unpublish") {
                        if (!data.entry.push) {
                            data.entry = [data.entry];
                        }
                        for (let i = 0; i < data.entry.length; i++) {
                            let entry = data.entry[i];
                            await this.deleteMarketPlaces(entry.id);
                        }
                    }
                break;
            }

        }catch(err) {
            console.log("SQS 'strapi_webhook' Error:", err);
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
