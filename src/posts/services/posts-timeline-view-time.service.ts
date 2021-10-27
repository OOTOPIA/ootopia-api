import { HttpException, Injectable } from '@nestjs/common';
import { ConfigName } from 'src/general-config/general-config.entity';
import { GeneralConfigService } from 'src/general-config/general-config.service';
import { Origin, WalletTransferAction } from 'src/wallet-transfers/wallet-transfers.entity';
import { WalletTransfersService } from 'src/wallet-transfers/wallet-transfers.service';
import { WalletsService } from 'src/wallets/wallets.service';
import { getConnection } from 'typeorm';
import { PostsService } from '../posts.service';
import { PostsTimelineViewTimeRepository } from '../repositories/posts-timeline-view-time.repository';

@Injectable()
export class PostsTimelineViewTimeService {

    constructor(
        private readonly postsTimelineViewTimeRepository : PostsTimelineViewTimeRepository,
        private readonly generalConfigService : GeneralConfigService,
        private readonly walletsService : WalletsService,
        private readonly walletTransfersService : WalletTransfersService,
        private readonly postsService : PostsService
        ) {

    }

    async recordTimelineViewTime(data) {

        if (!data || !data.timeInMilliseconds || !data.userId) {
            throw new HttpException('Mandatory data not found', 400);
        }

        let queryRunner = getConnection().createQueryRunner();
        await queryRunner.startTransaction();

        try {

            await queryRunner.manager.save(await this.postsTimelineViewTimeRepository.recordTimelineViewTime(data));

            //Reward to user 

            let oozToUserReward = +((await this.generalConfigService.getConfig(ConfigName.USER_REWARD_PER_MINUTE_OF_TIMELINE_VIEW_TIME)).value);
            let duration = +((+data.timeInMilliseconds / 1000).toFixed(0));
            let totalUserOOZ = oozToUserReward * (duration / 60);

            let receiverUserWalletId = (await this.walletsService.getWalletByUserId(data.userId)).id;

            await queryRunner.manager.save(await this.walletTransfersService.createTransfer(data.userId, {
                userId : data.userId,
                walletId : receiverUserWalletId,
                balance : totalUserOOZ,
                origin : Origin.TIMELINE_VIEW,
                action : WalletTransferAction.RECEIVED,
                fromPlatform : true
            }, true));

            await queryRunner.commitTransaction();

        }catch(err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        
    }

    async getUsersIdsWhoViewedTimelineInThisPeriod(startDateTime : Date, page : number) {
        return await this.postsTimelineViewTimeRepository.getUsersIdsWhoViewedTimelineInThisPeriod(startDateTime, page);
    }

    async getTimeSumOfUserViewedTimelineInThisPeriod(userId : string, startDateTime : Date) : Promise<number> {
        let result = await this.postsTimelineViewTimeRepository.getTimeSumOfUserViewedTimelineInThisPeriod(userId, startDateTime)
        return result.length ? +result[0].sum : 0;
    }

}
