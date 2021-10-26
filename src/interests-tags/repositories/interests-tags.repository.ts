import { Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import { InterestsTags } from "../entities/interests-tags.entity";
import { InterestsTagsUsers } from '../entities/interests-tags-users.entity';

@Injectable()
@EntityRepository(InterestsTags)
export class InterestsTagsRepository extends Repository<InterestsTags>{

    async getTags(language : string) {
        let exclusiveInterestTagsByLanguage = await getConnection().query('select language from interests_tags group by language');

        let isLanguage = exclusiveInterestTagsByLanguage.find( tag => tag.language.indexOf(language) == 0 && !!language);

        if (!isLanguage) {
            isLanguage = {};
            isLanguage.language = 'en-US';
        }

        return this.find({
            where: { active: true, language: isLanguage.language }
        });
    }

}