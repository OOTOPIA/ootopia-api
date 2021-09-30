import { Injectable } from '@nestjs/common';
import { LearningTracksService } from './learning-tracks/learning-tracks.service';
import { LearningTracksInterface } from './strapi.interface';

@Injectable()
export class StrapiService {
    
    learningTracks : LearningTracksInterface;

    constructor(learningTracks : LearningTracksService){
        this.learningTracks = learningTracks;
    };

}
