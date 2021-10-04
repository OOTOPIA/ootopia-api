import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import * as camelcaseKeys from 'camelcase-keys';
import { LearningTracks } from "./learning-tracks.entity";
import { LearningTracksFilterDto } from "./learning-tracks.dto";

@Injectable()
@EntityRepository(LearningTracks)
export class LearningTracksRepository extends Repository<LearningTracks>{

    constructor() {
        super();
    }

    createOrUpdate(learningTrackData) {
        const learningTrack = this.create();
        Object.assign(learningTrack, learningTrackData);
        return this.save(learningTrack);
    }

    getLearningTracks(filters : LearningTracksFilterDto) {

        let limit = 50, offset = 0, where : any = {}, locale = "en";

        if (filters.limit) {
            if (filters.limit > 50) {
                filters.limit = 50;
            }
            limit = filters.limit;
            offset = filters.offset || 0;
        }

        if (filters.locale) {
            where.locale = filters.locale;
        }else{
            where.locale = locale;
        }

        return this.createQueryBuilder("learning-tracks")
            .where(where)
            .orderBy("strapi_id", "DESC")
            .limit(limit)
            .offset(offset)
            .getMany();

    }

    getByStrapiId(strapiId) {
        return this.findOne({
            where :{ strapiId }
        });
    }

    async deleteLearningTrack(strapiId) {
        if (!strapiId) {
            throw new HttpException("Permission denied (id not found)", 403);
        }
        const data = await this.findOne({
            where : {
                strapiId
            }
        });
        if (!data) {
            throw new HttpException("Permission denied", 403);
        }
        data.deletedAt = new Date();
        return await this.save(data);
    }

}