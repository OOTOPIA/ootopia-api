import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SqsMessageHandler } from "@ssut/nestjs-sqs";
import { LearningTracksService } from 'src/learning-tracks/learning-tracks.service';
import { MarketPlaceService } from 'src/market-place/market-place.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class StrapiWebhookHandlerService {

    constructor(
        private readonly usersService : UsersService,
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
                            let learningTrack = await this.createOrUpdateLearningTrack(entry, data.event);
                            if(learningTrack) await this.createLinkInUserProfile(learningTrack, 'learning-tracks');
                        }
                    }else if (data.event == "entry.delete" || data.event == "entry.unpublish") {
                        if (!data.entry.push) {
                            data.entry = [data.entry];
                        }
                        for (let i = 0; i < data.entry.length; i++) {
                            let entry = data.entry[i];
                            let learningTrack: any = await this.deleteLearningTrack(entry.id);
                            learningTrack.author = entry.author;
                            await this.createLinkInUserProfile(learningTrack, 'learning-tracks', false);
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
                            let marketPlaces = await this.createOrUpdateMarketPlaces(entry, data.event);
                            if(marketPlaces) await this.createLinkInUserProfile(marketPlaces, 'market-place');
                        }
                    }else if (data.event == "entry.delete" || data.event == "entry.unpublish") {
                        if (!data.entry.push) {
                            data.entry = [data.entry];
                        }
                        for (let i = 0; i < data.entry.length; i++) {
                            let entry = data.entry[i];
                            let marketPlaces: any = await this.deleteMarketPlaces(entry.id);
                            marketPlaces.author = entry.seller;
                            await this.createLinkInUserProfile(marketPlaces, 'market-place', false);
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
        return this.learningTracksService.createOrUpdate(entry, event);
    }

    async createLinkInUserProfile(modal, event : string, create: boolean = true) {
        await this.usersService.updateLinks(modal, modal && modal.userId ? modal.userId : null, event, create);
    }

    async deleteLearningTrack(entryId) {
        return this.learningTracksService.deleteLearningTrack(entryId);
    }

    async createOrUpdateMarketPlaces(entry, event : string) {
        return this.marketPlaceService.createOrUpdate(entry, event);
    }

    async deleteMarketPlaces(entryId) {
        return this.marketPlaceService.deleteMarketPlaces(entryId);
    }

}
