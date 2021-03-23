import { Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import { InterestsTagsUsers } from '../entities/interests-tags-users.entity';

@Injectable()
@EntityRepository(InterestsTagsUsers)
export class InterestsTagsUsersRepository extends Repository<InterestsTagsUsers>{

    addUserTag(userId : string, tagId : string) {
        const userTag = this.create();
        Object.assign(userTag, {
            userId,
            tagId
        });
        return userTag;
    }

}