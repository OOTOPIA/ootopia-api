import { Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection, ILike } from 'typeorm';
import { InterestsTags } from "../entities/interests-tags.entity";
import { InterestsTagsUsers } from '../entities/interests-tags-users.entity';
import { FilterSearchHashtagDto } from '../interests-tags.dto';

@Injectable()
@EntityRepository(InterestsTags)
export class InterestsTagsRepository extends Repository<InterestsTags>{

    async getTags(language: string) {
        let exclusiveInterestTagsByLanguage = await getConnection().query('select language from interests_tags group by language');

        let isLanguage = exclusiveInterestTagsByLanguage.find(tag => tag.language.indexOf(language) == 0 && !!language);

        if (!isLanguage) {
            isLanguage = {};
            isLanguage.language = 'en-US';
        }

        return this.find({
            where: { active: true, language: isLanguage.language }
        });
    }

    tagByStrapiId(id) {
        return this.findOne({
            where: { strapiId: id }
        });
    }
    createOrUpdateHashtag(hashTagData) {
        console.log(hashTagData)
        const hashTag = this.create();
        Object.assign(hashTag, hashTagData);
        return this.save(hashTag);
    }
    searchTag(data: FilterSearchHashtagDto) {
        let where = `where i.active is true`;
        let params = [];

        if (data.name) {
            params.push(`%${data.name}%`);
            where += ` AND i.name like $${params.length}`;
        }
        if (data.language) {
            params.push(data.language);
            where += ` AND i.language = $${params.length}`;
        }
        return this.query(`select i.id,
        i.language,
        i.name,
        (select count(*)::int from interests_tags_posts itp where itp.tag_id = i.id) as "numberOfPosts"
        from interests_tags i
        ${where}
        order by created_at desc
        offset ${data.page - 1}
        limit ${data.limit}
        `, params);


    }

}