import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import { Posts } from "./posts.entity";
import * as camelcaseKeys from 'camelcase-keys';
import { Medias } from './media.entity';

@Injectable()
@EntityRepository(Medias)
export class MediasRepository extends Repository<Medias>{

    constructor() {
        super();
    }

    async createOrUpdateMedia(mediaData): Promise<Medias> {
        const media = this.create();
        Object.assign(media, mediaData);
        return await this.save(media);
    }

    async updatePostIdInMedia(postId, mediaId) {
        return await this.update(mediaId, {
            postId
        });
    }

    async verifyMediasStatus(mediasIds) {
        let medias = await this.findByIds(mediasIds);
        let verify = medias.some(media => media.status == 'ready');
        return verify
    }

    async getMediaByStreamMediaId(streamMediaId) {
        return await this.findOne({
            where: {
                streamMediaId
            }
        });
    }

    async updateMedia(mediaId, status, duration) {
        return await this.update(mediaId, {
            status,
            durationInSecs: duration
        });
    }

    async getMediasByStreamMediaId(streamMediaId) {
        let result = await this.query(`
        select
        p.id,
        p.media_ids
        from medias m
        inner join posts p on p.id = m.post_id
        where m.stream_media_id = $1 ;`, [streamMediaId]);
        if(result.length) {
            return result[0];
        }
        return null;
    }
}