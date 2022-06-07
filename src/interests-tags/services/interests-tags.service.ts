import { Injectable } from '@nestjs/common';
import { getConnection } from 'typeorm';
import { InterestsTagsPosts } from '../entities/interests-tags-posts.entity';
import { InterestsTagsUsers } from '../entities/interests-tags-users.entity';
import { InterestsTagsPostsRepository } from '../repositories/interests-tags-posts.repository';
import { InterestsTagsUsersRepository } from '../repositories/interests-tags-users.repository';
import { InterestsTagsRepository } from '../repositories/interests-tags.repository';
import { CreateTagDto, FilterSearchHashtagDto } from '../interests-tags.dto';
import { StrapiService } from '../../strapi/strapi.service';

@Injectable()

export class InterestsTagsService {
    constructor(
        private readonly interestsTagsRepository : InterestsTagsRepository, 
        private readonly interestsTagsUsersRepository : InterestsTagsUsersRepository,
        private readonly interestsTagsPostsRepository : InterestsTagsPostsRepository,
        private readonly strapiService: StrapiService) {

    }

    async getTags(language : string) {
        let tags = await this.interestsTagsRepository.getTags(language);
        return tags.map(function (tag) {
            tag.tagOrder = +tag.tagOrder;
            return tag;
        });
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
        } finally {
            if (!originQueryRunner) {
                await queryRunner.release();
            }
        }

    }

    async updatePostTags(postId : string, tagsIds : string[], originQueryRunner = null) {
        
        let queryRunner;

        try {

            if (!originQueryRunner) {
                queryRunner = getConnection().createQueryRunner();
                await queryRunner.connect();
                await queryRunner.startTransaction();
            }else{
                queryRunner = originQueryRunner;
            }

            queryRunner.manager.delete(InterestsTagsPosts, {
                postId : postId
            });

            for (let i = 0; i < tagsIds.length; i++) {
                let tagId = tagsIds[i];
                await queryRunner.manager.save(await this.interestsTagsPostsRepository.addPostTag(postId, tagId));
            }

            if (!originQueryRunner) {
                await queryRunner.commitTransaction();
            }

            return queryRunner;

        }catch(err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            if(!originQueryRunner) {
                await queryRunner.release();
            }
            
        }

    }

    async createOrUpdateHashTags(tag) {
        try {
            let idTag = (await this.interestsTagsRepository.tagByStrapiId(tag.strapiId)) || null;
            if(!!idTag) tag.id = idTag.id;
            await this.interestsTagsRepository.createOrUpdateHashtag(tag)
        } catch (error) {
            console.log(error)
        }
    }

    async createTag(data: CreateTagDto) {
        let strapiId = await this.strapiService.createHashTag(data);
        return this.interestsTagsRepository.tagByStrapiId(strapiId);
    }

    async searchTag(data: FilterSearchHashtagDto) {
        return await this.interestsTagsRepository.searchTag(data);
    }


}
