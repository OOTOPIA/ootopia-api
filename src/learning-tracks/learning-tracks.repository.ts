import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection, IsNull } from "typeorm";
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

    async getLearningTracks(filters : LearningTracksFilterDto) {

        let limit = 50, offset = 0, where : any = {deletedAt : IsNull(), }, locale = "en";

        
        if (filters.id) {
            where.id = filters.id;
        }

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

    async getById(learningTrackId : string) {
        return await this.findOne({
            where :{ id : learningTrackId, deletedAt : IsNull() }
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

    async markChapterCompleted(learningTrackId, chapterId, userId) {
        return await getConnection().query(`
            INSERT INTO learning_track_completed_chapters (learning_track_id, chapter_id, user_id)
            SELECT $1, $2, $3
            WHERE NOT EXISTS (
                SELECT * FROM learning_track_completed_chapters WHERE learning_track_id = $1 AND chapter_id = $2 AND user_id = $3
            )
            RETURNING *;
        `, [
            learningTrackId,
            `${chapterId}`,
            userId
        ]);
    }

}