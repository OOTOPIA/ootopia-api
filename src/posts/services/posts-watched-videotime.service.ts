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

    async recordWatchedVideotime(postId : string, data) {

        if (!postId || !data) {
            throw new HttpException('Post ID is mandatory', 400);
        }

        let queryRunner = getConnection().createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {

            let post = await this.postsService.getPostById(postId);

            await queryRunner.manager.save(await this.postsWatchedVideotimeRepository.recordWatchedVideotime(data));

            //Reward to user 

            let oozToUserReward = +((await this.generalConfigService.getConfig(ConfigName.USER_REWARD_PER_MINUTE_OF_WATCHED_VIDEO)).value);
            let duration = +((+data.timeInMilliseconds / 1000).toFixed(0));
            let totalUserOOZ = oozToUserReward * (duration / 60);

            let receiverUserWalletId = (await this.walletsService.getWalletByUserId(data.userId)).id;

            await queryRunner.manager.save(await this.walletTransfersService.createTransfer(data.userId, {
                userId : data.userId,
                walletId : receiverUserWalletId,
                balance : totalUserOOZ,
                origin : Origin.TRANSFER,
                action : WalletTransferAction.RECEIVED,
                fromPlatform : true
            }, true));

            await queryRunner.manager.save(await this.walletsService.increaseTotalBalance(receiverUserWalletId, data.userId, totalUserOOZ));

            //Reward to creator of post

            let oozToCreatorReward = +((await this.generalConfigService.getConfig(ConfigName.CREATOR_REWARD_PER_MINUTE_OF_POSTED_VIDEO)).value);
            let totalCreatorOOZ = oozToCreatorReward * (duration / 60);

            let receiverCreatorWalletId = (await this.walletsService.getWalletByUserId(post.userId)).id;

            await queryRunner.manager.save(await this.walletTransfersService.createTransfer(post.userId, {
                userId : post.userId,
                walletId : receiverCreatorWalletId,
                balance : totalCreatorOOZ,
                origin : Origin.TRANSFER,
                action : WalletTransferAction.RECEIVED,
                fromPlatform : true
            }, true));

            await queryRunner.manager.save(await this.walletsService.increaseTotalBalance(receiverCreatorWalletId, post.userId, totalCreatorOOZ));

            await queryRunner.commitTransaction();

        }catch(err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        
    }

}
