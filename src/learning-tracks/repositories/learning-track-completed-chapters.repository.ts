import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection, IsNull } from "typeorm";
import * as camelcaseKeys from 'camelcase-keys';
import { LearningTrackCompletedChapters } from "../entities/learning-track-completed-chapters.entity";
import { LearningTracks } from "../learning-tracks.entity";

@Injectable()
@EntityRepository(LearningTrackCompletedChapters)
export class LearningTrackCompletedChaptersRepository extends Repository<LearningTrackCompletedChapters>{

    constructor() {
        super();
    }

    async getCompletedChaptersOfLearningTracks(learningTrackIds : string[], userId : string) {
        return camelcaseKeys(await this.createQueryBuilder()
            .select(["id", "chapter_id", "learning_track_id"])
            .where("learning_track_id IN (:...ids)", { ids : learningTrackIds })
            .andWhere("user_id = :userId", { userId })
            .getRawMany(), { deep : true });
    }

}