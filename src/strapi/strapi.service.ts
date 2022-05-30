import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';
import { SqsWorkerService } from 'src/sqs-worker/sqs-worker.service';

@Injectable()
export class StrapiService {

    constructor(
        private readonly sqsWorkerService : SqsWorkerService,
    ){};

    async webhook(data) {
        
        if (!data) {
            return;
        }
        
        if (data.event == "entry.publish" || data.event == "entry.update" || data.event == "entry.delete" || data.event == "entry.unpublish") {
            switch(data.model) {
                case "learning-tracks":
                        await this.sqsWorkerService.sendStrapiWebhookMessage(data);
                break;
                case "market-place":
                        await this.sqsWorkerService.sendStrapiWebhookMessage(data);
                break;
                case "hashtags" : 
                    await this.sqsWorkerService.sendStrapiWebhookMessage(data);
                break;
            }
        }
        return { "status" : "success" };

    }

    private async login() {
        try {
            let login = await axios.post(`${process.env.STRAPI_URL}/admin/login`, {
                email: process.env.STRAPI_EMAIL,
                password: process.env.STRAPI_PASSWORD
            })
            console.log(login)
            return login.data.data.token
        } catch (error) {
            throw new HttpException(error, 400)
        }
    }

    async deleteLearningTrack(strapiId: number) {
        try {
            let token = await this.login()
            let deleted = await axios.delete(`${process.env.STRAPI_URL}/content-manager/collection-types/application::learning-tracks.learning-tracks/${strapiId}`, {
                headers: {
                    authorization: `Bearer ${token}`
                }
            })
            return deleted.data
        } catch (error) {
            throw new HttpException(error, 400)
        }
    }
    async deleteMarketPlace(strapiId: number) {
        try {
            let token = await this.login()
            let deleted = await axios.delete(`${process.env.STRAPI_URL}/content-manager/collection-types/application::market-place.market-place/${strapiId}`, {
                headers: {
                    authorization: `Bearer ${token}`
                }
            })
    
            return deleted.data
        } catch (error) {
            throw new HttpException(error, 400)
        }
    }

}
