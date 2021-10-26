import { Injectable } from '@nestjs/common';
import { TrophyType } from 'src/users/entities/users-trophies.entity';
import { UsersTrophiesRepository } from 'src/users/repositories/users-trophies.repository';

@Injectable()
export class UsersTrophiesService {

    constructor(private readonly usersTrophiesRepository : UsersTrophiesRepository) {}

    async createOrUpdateTrophy(trophyData : { userId : string, trophyType : TrophyType }) {
        return await this.usersTrophiesRepository.createOrUpdateTrophy(trophyData);
    }

}
