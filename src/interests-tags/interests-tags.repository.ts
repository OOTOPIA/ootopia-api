import { Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import { InterestsTags } from "./interests-tags.entity";

@Injectable()
@EntityRepository(InterestsTags)
export class InterestsTagsRepository extends Repository<InterestsTags>{

    getTags(language : string) {
        if (!language) {
            language = "pt-BR";
        }
        return this.find({
            where: { active: true, language }
        });
    }

}