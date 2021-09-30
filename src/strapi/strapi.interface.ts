import { LearningTracksFilterDto } from "src/learning-tracks/learning-tracks.dto";

export interface ProviderApi {

    learningTracks : LearningTracksInterface

}

export interface LearningTracksInterface {

    getAll(filters : LearningTracksFilterDto) : any
    getById(id : number) : any

}