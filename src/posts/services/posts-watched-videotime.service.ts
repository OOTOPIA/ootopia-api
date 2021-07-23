import { HttpException, Injectable } from '@nestjs/common';
import { ConfigName } from 'src/general-config/general-config.entity';
import { GeneralConfigService } from 'src/general-config/general-config.service';
import { Origin, WalletTransferAction } from 'src/wallet-transfers/wallet-transfers.entity';
import { WalletTransfersService } from 'src/wallet-transfers/wallet-transfers.service';
import { WalletsService } from 'src/wallets/wallets.service';
import { getConnection } from 'typeorm';
import { PostWatchedVideoTimeDto } from '../posts.dto';
import { PostsService } from '../posts.service';
import { PostsWatchedVideotimeRepository } from '../repositories/posts-watched-videotime.repository';
import * as camelcaseKeys from 'camelcase-keys';

@Injectable()
export class PostsWatchedVideotimeService {

    constructor(
        private readonly postsWatchedVideotimeRepository : PostsWatchedVideotimeRepository,
        private readonly generalConfigService : GeneralConfigService,
        private readonly walletsService : WalletsService,
        private readonly walletTransfersService : WalletTransfersService,
        private readonly postsService : PostsService
        ) {

    }

    async recordWatchedVideotime(userId : string, records : PostWatchedVideoTimeDto[]) {

        if (!userId || !records || !records.length) {
            throw new HttpException('Post ID is mandatory', 400);
        }

        let groupedPostsIds : any = {};

        records.forEach((record) => {
            record = camelcaseKeys(record);
            if (!groupedPostsIds[record.postId]) {
                groupedPostsIds[record.postId] = {
                    postId : record.postId,
                    timeInMilliseconds : +record.timeInMilliseconds,
                };
            }else{
                groupedPostsIds[record.postId].timeInMilliseconds = groupedPostsIds[record.postId].timeInMilliseconds + +record.timeInMilliseconds
            }
        });

        let queryRunner = getConnection().createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {

            let oozToUserReward = +((await this.generalConfigService.getConfig(ConfigName.USER_REWARD_PER_MINUTE_OF_WATCHED_VIDEO)).value);
            let oozToCreatorReward = +((await this.generalConfigService.getConfig(ConfigName.CREATOR_REWARD_PER_MINUTE_OF_POSTED_VIDEO)).value);

            for (let i = 0; i < Object.keys(groupedPostsIds).length; i++) {

                let record = groupedPostsIds[Object.keys(groupedPostsIds)[i]];
                let post = await this.postsService.getPostById(record.postId);

                await queryRunner.manager.save(await this.postsWatchedVideotimeRepository.recordWatchedVideotime({
                    userId : userId,
                    postId : record.postId,
                    timeInMilliseconds : record.timeInMilliseconds
                }));

                //Reward to user 
                let duration = +((+record.timeInMilliseconds / 1000).toFixed(0));
                let totalUserOOZ = oozToUserReward * (duration / 60);
                let receiverUserWalletId = (await this.walletsService.getWalletByUserId(userId)).id;

                if (totalUserOOZ > 0) {

                    await queryRunner.manager.save(await this.walletTransfersService.createTransfer(userId, {
                        userId : userId,
                        walletId : receiverUserWalletId,
                        balance : totalUserOOZ,
                        origin : Origin.WATCHED_VIDEOS,
                        action : WalletTransferAction.RECEIVED,
                        fromPlatform : true,
                        processed : false
                    }, true));

                }

                //Reward to creator of post
                let totalCreatorOOZ = oozToCreatorReward * (duration / 60);
                let receiverCreatorWalletId = (await this.walletsService.getWalletByUserId(post.userId)).id;

                if (totalCreatorOOZ > 0) {

                    await queryRunner.manager.save(await this.walletTransfersService.createTransfer(post.userId, {
                        userId : post.userId,
                        walletId : receiverCreatorWalletId,
                        balance : totalCreatorOOZ,
                        origin : Origin.TRANSFER,
                        action : WalletTransferAction.RECEIVED,
                        fromPlatform : true,
                        processed : false
                    }, true));

                }

            }

            await queryRunner.commitTransaction();

        }catch(err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        
    }

    async getUsersIdsWhoWatchedVideosInThisPeriod(startDateTime : Date, page : number) {
        return await this.postsWatchedVideotimeRepository.getUsersIdsWhoWatchedVideosInThisPeriod(startDateTime, page);
    }

    async getTimeSumOfUserWatchedVideosInThisPeriod(userId : string, startDateTime : Date) : Promise<number> {
        let result = await this.postsWatchedVideotimeRepository.getTimeSumOfUserWatchedVideosInThisPeriod(userId, startDateTime)
        return result.length ? +result[0].sum : 0;
    }

}
