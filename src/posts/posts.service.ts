import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { AddressesRepository } from 'src/addresses/addresses.repository';
import { CitiesService } from 'src/cities/cities.service';
import { InterestsTagsService } from 'src/interests-tags/services/interests-tags.service';
import { VideoService } from 'src/video/video.service';
import { getConnection } from 'typeorm';
import { PostsRepository } from './posts.repository';
import { v4 as uuidv4 } from 'uuid';
import { GeneralConfigService } from 'src/general-config/general-config.service';
import { ConfigName } from 'src/general-config/general-config.entity';
import { WalletTransfersService } from 'src/wallet-transfers/wallet-transfers.service';
import { WalletsService } from 'src/wallets/wallets.service';
import { Origin, WalletTransferAction } from 'src/wallet-transfers/wallet-transfers.entity';

@Injectable()
export class PostsService {

    constructor(
      private readonly postsRepository : PostsRepository, 
      private readonly videoService : VideoService,
      private readonly interestsTagsService : InterestsTagsService,
      private readonly citiesService : CitiesService,
      private readonly addressesRepository : AddressesRepository,
      private readonly generalConfigService : GeneralConfigService,
      private readonly walletsService : WalletsService,
      @Inject(forwardRef(() => WalletTransfersService))
      private readonly walletTransfersService : WalletTransfersService,
      ) {

    }

    async createPost(fileBuffer, postData, userId) {

      postData.id = uuidv4();

      let queryRunner = getConnection().createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      console.log("new post data", postData);

      try {

        let video : any = await this.videoService.uploadVideo(fileBuffer, postData.description);

        postData.userId = userId;
        postData.videoUrl = video.playback.hls;
        postData.thumbnailUrl = video.thumbnail;
        postData.streamMediaId = video.uid;

        let postResult : any = await this.postsRepository.createOrUpdatePost(postData);

        if (postData.addressCountryCode && postData.addressState && postData.addressCity) {

          console.log(">>> post has address");

          let city = await this.citiesService.getCity(postData.addressCity, postData.addressState, postData.addressCountryCode);
          if (!city) {
            console.log(">>> created new city entry");
              city = await this.citiesService.createCity({
                  city : postData.addressCity,
                  state : postData.addressState,
                  country : postData.addressCountryCode,
              });
          }

          let addressData : any = {
              city : city,
              lat : postData.addressLatitude,
              lng : postData.addressLongitude,
              number : postData.addressNumber
          };

          let address = await this.addressesRepository.createOrUpdateAddress(addressData);

          console.log(">>> saved address info", address);
          postResult.addressId = address.id;
          
          await queryRunner.manager.save(address);

        }

        if (postData.tagsIds && postData.tagsIds.length > 0) {
          let tagsIds = postData.tagsIds.split(",");
          await this.interestsTagsService.updatePostTags(postResult.id, tagsIds, queryRunner);
        }

        await queryRunner.manager.save(postResult);
        await queryRunner.commitTransaction();
        return postResult;

      }catch(err) {
        await this.postsRepository.deletePost(postData.id);
        await queryRunner.rollbackTransaction();
        throw err;
      }
     
    }

    getPostById(id) {
      return this.postsRepository.getPostById(id);
    }

    async likePost(postId, userId) {
      let likeResult = await this.postsRepository.likePost(postId, userId);
      if (likeResult.liked) {
        await this.sendRewardToCreatorForWoowReceived(postId);
      }
      return likeResult;
    }

    private async sendRewardToCreatorForWoowReceived(postId) {

      if (!postId) {
          throw new HttpException('Post ID not found', 400);
      }

      let queryRunner = getConnection().createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {

          let oozToReward = +((await this.generalConfigService.getConfig(ConfigName.CREATOR_REWARD_FOR_WOOW_RECEIVED)).value);
          let post = await this.getPostById(postId);
          let receiverUserWalletId = (await this.walletsService.getWalletByUserId(post.userId)).id;

          await queryRunner.manager.save(await this.walletTransfersService.createTransfer(post.userId, {
              userId : post.userId,
              walletId : receiverUserWalletId,
              balance : oozToReward,
              origin : Origin.TRANSFER,
              action : WalletTransferAction.RECEIVED,
              fromPlatform : true,
              processed : true
          }, true));

          await queryRunner.manager.save(await this.walletsService.increaseTotalBalance(receiverUserWalletId, post.userId, oozToReward));

          await queryRunner.commitTransaction();

      }catch(err) {
          await queryRunner.rollbackTransaction();
          throw err;
      }
      
  }

    //Se rewardToCreator for true, uma recompensa em OOZ será transferida ao criador a cada 60 segundos do vídeo postado se o novo status do video for "ready"

    async updatePostVideoStatus(streamMediaId : string, status : string, rewardToCreator? : boolean) {
      let videoDetails = (await this.videoService.getVideoDetails(streamMediaId)).result;
      let post = (await this.postsRepository.getPostByStreamMediaId(streamMediaId));
      post.videoStatus = status;
      post.durationInSecs = +videoDetails.duration;
      let result = await this.postsRepository.createOrUpdatePost(post);
      if (rewardToCreator && status == "ready") {
        try {
          await this.sendRewardToCreatorForPost(post.id);
        }catch(err) {
          //do nothing
        }
      }
      return result;
    }

    async sendRewardToCreatorForPost(postId : string) {

      let queryRunner = getConnection().createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {

        let oozToReward = +((await this.generalConfigService.getConfig(ConfigName.CREATOR_REWARD_PER_MINUTE_OF_POSTED_VIDEO)).value);
        let post = await this.getPostById(postId);
        let duration = +((+post.durationInSecs).toFixed(0));
        let totalOOZ = oozToReward * (duration / 60);

        let receiverUserWalletId = (await this.walletsService.getWalletByUserId(post.userId)).id;

        await queryRunner.manager.save(await this.walletTransfersService.createTransfer(post.userId, {
          userId : post.userId,
          walletId : receiverUserWalletId,
          balance : totalOOZ,
          origin : Origin.TRANSFER,
          action : WalletTransferAction.RECEIVED,
          fromPlatform : true
        }, true));

        await queryRunner.manager.save(await this.walletsService.increaseTotalBalance(receiverUserWalletId, post.userId, totalOOZ));

        await queryRunner.commitTransaction();

      }catch(err) {
        await queryRunner.rollbackTransaction();
        throw err;
      }
      
    }

    async getPostsTimeline(filters, userId? : string) {
      return this.postsRepository.getPostsTimeline(filters, userId);
    }

    async deletePost(postId, userId) {
      let result = await this.postsRepository.deletePostByUser(postId, userId);
      await this.videoService.deleteVideo(result.streamMediaId);
    }

    incrementOOZTotalCollected(balance : number, postId : string) {
      return this.postsRepository.incrementOOZTotalCollected(balance, postId);
    }

}
