import { Injectable } from '@nestjs/common';
import { InterestsTagsRepository } from './interests-tags.repository';

@Injectable()
export class InterestsTagsService {

    constructor(private readonly interestsTagsRepository : InterestsTagsRepository) {

    }

    getTags(language : string) {
        return this.interestsTagsRepository.getTags(language);
    }

}
