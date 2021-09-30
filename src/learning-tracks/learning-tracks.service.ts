import { Injectable } from '@nestjs/common';
import { StrapiService } from 'src/strapi/strapi.service';
import { LearningTracksFilterDto } from './learning-tracks.dto';

@Injectable()
export class LearningTracksService {

    constructor(private readonly strapiService : StrapiService) {

    }

    async getLearningTracks(filters : LearningTracksFilterDto) {
        return await this.strapiService.learningTracks.getAll(filters);
    }

}
