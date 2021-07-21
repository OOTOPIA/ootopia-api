import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { AddressesRepository } from 'src/addresses/addresses.repository';
import { CitiesService } from 'src/cities/cities.service';
import { InterestsTagsService } from 'src/interests-tags/services/interests-tags.service';
import { VideoService } from 'src/video/video.service';
import { FilesUploadService } from 'src/files-upload/files-upload.service'
import { getConnection } from 'typeorm';
import { PostsRepository } from './posts.repository';
import { v4 as uuidv4 } from 'uuid';
import { GeneralConfigService } from 'src/general-config/general-config.service';
import { ConfigName } from 'src/general-config/general-config.entity';
import { WalletTransfersService } from 'src/wallet-transfers/wallet-transfers.service';
import { WalletsService } from 'src/wallets/wallets.service';
import {
  Origin,
  WalletTransferAction,
} from 'src/wallet-transfers/wallet-transfers.entity';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly videoService: VideoService,
    private readonly filesUploadService: FilesUploadService,
    private readonly interestsTagsService: InterestsTagsService,
    private readonly citiesService: CitiesService,
    private readonly addressesRepository: AddressesRepository,
    private readonly generalConfigService: GeneralConfigService,
    private readonly walletsService: WalletsService,
    @Inject(forwardRef(() => WalletTransfersService))
    private readonly walletTransfersService: WalletTransfersService,
  ) {}
 
  async createPost(file, postData, userId) {
    postData.id = uuidv4();

    const queryRunner = getConnection().createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    console.log('new post data', postData);

    try {
      if (postData.type === 'image') {
        const imagesAcceptTypes = ['image/png', 'image/jpeg'];
        if (imagesAcceptTypes.includes(file.mimetype)) {
          postData.thumbnailUrl = postData.imageUrl = await this.filesUploadService.uploadFileToS3Minio(
            file.buffer,
            file.originalname,
            userId,
          );
        }
      } else {
        const video: any = await this.videoService.uploadVideo(
          file.buffer,
          postData.description,
        );
        postData.videoUrl = video.playback.hls;
        postData.thumbnailUrl = video.thumbnail;
        postData.streamMediaId = video.uid;
      }
      postData.userId = userId;
      
      const postResult: any = await this.postsRepository.createOrUpdatePost(
        postData,
      );

      if (
        postData.addressCountryCode &&
        postData.addressState &&
        postData.addressCity
      ) {
        console.log('>>> post has address');

        let city = await this.citiesService.getCity(
          postData.addressCity,
          postData.addressState,
          postData.addressCountryCode,
        );
        if (!city) {
          console.log('>>> created new city entry');
          city = await this.citiesService.createCity({
            city: postData.addressCity,
            state: postData.addressState,
            country: postData.addressCountryCode,
          });
        }

        const addressData: any = {
          city: city,
          lat: postData.addressLatitude,
          lng: postData.addressLongitude,
          number: postData.addressNumber,
        };

        const address = await this.addressesRepository.createOrUpdateAddress(
          addressData,
        );

        console.log('>>> saved address info', address);
        postResult.addressId = address.id;

        await queryRunner.manager.save(address);
      }

      if (postData.tagsIds && postData.tagsIds.length > 0) {
        const tagsIds = postData.tagsIds.split(',');
        await this.interestsTagsService.updatePostTags(
          postResult.id,
          tagsIds,
          queryRunner,
        );
      }

      await queryRunner.manager.save(postResult);
      await queryRunner.commitTransaction();
      return postResult;
    } catch (err) {
      await this.postsRepository.deletePost(postData.id);
      await queryRunner.rollbackTransaction();
      throw err;
    }
  }

  getPostById(id) {
    return this.postsRepository.getPostById(id);
  }

  async likePost(postId, userId) {
    const likeResult = await this.postsRepository.likePost(postId, userId);
    if (likeResult.liked) {
      await this.sendRewardToCreatorForWoowReceived(postId);
    }
    return likeResult;
  }

  private async sendRewardToCreatorForWoowReceived(postId) {
    if (!postId) {
      throw new HttpException('Post ID not found', 400);
    }

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const oozToReward = +(
        await this.generalConfigService.getConfig(
          ConfigName.CREATOR_REWARD_FOR_WOOW_RECEIVED,
        )
      ).value;
      const post = await this.getPostById(postId);
      const receiverUserWalletId = (
        await this.walletsService.getWalletByUserId(post.userId)
      ).id;

      await queryRunner.manager.save(
        await this.walletTransfersService.createTransfer(
          post.userId,
          {
            userId: post.userId,
            walletId: receiverUserWalletId,
            balance: oozToReward,
            origin: Origin.TRANSFER,
            action: WalletTransferAction.RECEIVED,
            fromPlatform: true,
            processed: true,
          },
          true,
        ),
      );

      await queryRunner.manager.save(
        await this.walletsService.increaseTotalBalance(
          receiverUserWalletId,
          post.userId,
          oozToReward,
        ),
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    }
  }

  //Se rewardToCreator for true, uma recompensa em OOZ será transferida ao criador a cada 60 segundos do vídeo postado se o novo status do video for "ready"

  async updatePostVideoStatus(
    streamMediaId: string,
    status: string,
    rewardToCreator?: boolean,
  ) {
    const videoDetails = (
      await this.videoService.getVideoDetails(streamMediaId)
    ).result;
    const post = await this.postsRepository.getPostByStreamMediaId(
      streamMediaId,
    );
    post.videoStatus = status;
    post.durationInSecs = +videoDetails.duration;
    const result = await this.postsRepository.createOrUpdatePost(post);
    if (rewardToCreator && status == 'ready') {
      try {
        await this.sendRewardToCreatorForPost(post.id);
      } catch (err) {
        //do nothing
      }
    }
    return result;
  }

  async sendRewardToCreatorForPost(postId: string) {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const oozToReward = +(
        await this.generalConfigService.getConfig(
          ConfigName.CREATOR_REWARD_PER_MINUTE_OF_POSTED_VIDEO,
        )
      ).value;
      const post = await this.getPostById(postId);
      const duration = +(+post.durationInSecs).toFixed(0);
      const totalOOZ = oozToReward * (duration / 60);

      const receiverUserWalletId = (
        await this.walletsService.getWalletByUserId(post.userId)
      ).id;

      await queryRunner.manager.save(
        await this.walletTransfersService.createTransfer(
          post.userId,
          {
            userId: post.userId,
            walletId: receiverUserWalletId,
            balance: totalOOZ,
            origin: Origin.TRANSFER,
            action: WalletTransferAction.RECEIVED,
            fromPlatform: true,
          },
          true,
        ),
      );

      await queryRunner.manager.save(
        await this.walletsService.increaseTotalBalance(
          receiverUserWalletId,
          post.userId,
          totalOOZ,
        ),
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    }
  }

  async getPostsTimeline(filters, userId?: string) {
    return this.postsRepository.getPostsTimeline(filters, userId);
  }

  async deletePost(postId, userId) {
    const result = await this.postsRepository.deletePostByUser(postId, userId);
    await this.videoService.deleteVideo(result.streamMediaId);
  }

  incrementOOZTotalCollected(balance: number, postId: string) {
    return this.postsRepository.incrementOOZTotalCollected(balance, postId);
  }
}
