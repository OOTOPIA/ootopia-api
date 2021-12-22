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

    async getLearningTracks(filters) {

        let limit = 50, 
            offset = 0, 
            where = 'deleted_at IS NULL AND ', 
            locale = "en",
            orderBy = filters.showAtTimeline ? " (CASE WHEN l.show_at_timeline THEN  1 else 2 END), l.updated_at " : " l.strapi_id ",
            params = [];

        let columns = [
            'l.*', 
            'u.fullname as user_name', 
            'u.photo_url as user_photo_url',
        ];

        if (filters.limit) {
            if (filters.limit > 50) {
                filters.limit = 50;
            }
            limit = filters.limit;
            offset = filters.offset || 0;
        }

        if (filters.strapiId) {
            params.push(filters.strapiId);
            where += `strapi_id = $${params.length} AND `;
        }

        if (filters.locale) {
            params.push(filters.locale);
            where += `locale = $${params.length} AND `;
        }else{
            params.push(locale);
            where += `locale = $${params.length} AND `;
        }

        where = where.substring(0, where.length - 5);

        return camelcaseKeys(await getConnection().query(`
            SELECT ${columns} FROM learning_tracks l
            LEFT JOIN users u ON u.id = l.user_id
            WHERE ${where}
            ORDER BY ${orderBy} DESC
            LIMIT ${limit} OFFSET ${offset}
        `, params), { deep : true }).map(this.mapper);

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

    mapper(learningTrack) {
        if (learningTrack.chapters) {
            learningTrack.chapters = JSON.parse(learningTrack.chapters);
        }
        if (!learningTrack.userPhotoUrl) {
            learningTrack.userPhotoUrl = "https://ootopia-files-staging.s3.sa-east-1.amazonaws.com/profile.png";
        }
        return camelcaseKeys(learningTrack);
    }

}