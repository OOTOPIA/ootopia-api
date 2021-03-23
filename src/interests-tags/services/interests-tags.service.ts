import { Injectable } from '@nestjs/common';
import { getConnection } from 'typeorm';
import { InterestsTagsUsers } from '../entities/interests-tags-users.entity';
import { InterestsTagsUsersRepository } from '../repositories/interests-tags-users.repository';
import { InterestsTagsRepository } from '../repositories/interests-tags.repository';

@Injectable()
export class InterestsTagsService {

    constructor(
        private readonly interestsTagsRepository : InterestsTagsRepository, 
        private readonly interestsTagsUsersRepository : InterestsTagsUsersRepository) {

    }

    getTags(language : string) {
        return this.interestsTagsRepository.getTags(language);
    }

    async updateUserTags(userId : string, tagsIds : string[], originQueryRunner = null) {
        
        let queryRunner;

        try {

            if (!originQueryRunner) {
                queryRunner = getConnection().createQueryRunner();
                await queryRunner.connect();
                await queryRunner.startTransaction();
            }else{
                queryRunner = originQueryRunner;
            }

            queryRunner.manager.delete(InterestsTagsUsers, {
                userId : userId
            });

            for (let i = 0; i < tagsIds.length; i++) {
                let tagId = tagsIds[i];
                await queryRunner.manager.save(await this.interestsTagsUsersRepository.addUserTag(userId, tagId));
            }

            if (!originQueryRunner) {
                await queryRunner.commitTransaction();
            }

            return queryRunner;

        }catch(err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }

    }

}
