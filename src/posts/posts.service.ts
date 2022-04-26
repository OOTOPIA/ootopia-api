import { forwardRef, HttpException, HttpService, Inject, Injectable } from '@nestjs/common';
import { AddressesRepository } from 'src/addresses/addresses.repository';
import { CitiesService } from 'src/cities/cities.service';
import { InterestsTagsService } from 'src/interests-tags/services/interests-tags.service';
import { VideoService } from 'src/video/video.service';
import { FilesUploadService } from 'src/files-upload/files-upload.service';
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
import { PostsUsersRewardedRepository } from './repositories/posts-users-rewarded.repository';
import { LinksService } from 'src/links/links.service';
import { UsersService } from 'src/users/users.service';
import * as jimp from 'jimp';
import { MediasRepository } from './media.repository';
import { UsersDeviceTokenService } from '../users-device-token/users-device-token.service';
import { NotificationMessagesService } from '../notification-messages/notification-messages.service';
import { InterestsTagsRepository } from '../interests-tags/repositories/interests-tags.repository';

import axios from 'axios';

@Injectable()
export class PostsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly mediasRepository: MediasRepository,
    private readonly linksService: LinksService,
    private readonly postsRepository: PostsRepository,
    private readonly postsUsersRewardedRepository: PostsUsersRewardedRepository,
    private readonly videoService: VideoService,
    private readonly filesUploadService: FilesUploadService,
    private readonly interestsTagsService: InterestsTagsService,
    private readonly citiesService: CitiesService,
    private readonly addressesRepository: AddressesRepository,
    private readonly generalConfigService: GeneralConfigService,
    private readonly walletsService: WalletsService,
    private readonly usersService: UsersService,
    private readonly usersDeviceTokenService: UsersDeviceTokenService,
    private readonly notificationMessagesService: NotificationMessagesService,
    private readonly interestsTagsRepository : InterestsTagsRepository,
    @Inject(forwardRef(() => WalletTransfersService))
    private readonly walletTransfersService: WalletTransfersService,
  ) { }

  async createPost(file, postData, userId) {
    postData.id = uuidv4();

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      var postResult: any = null;
      if (postData.type === 'image') {
        const imagesAcceptTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/octet-stream'];
        if (imagesAcceptTypes.includes(file.mimetype)) {
          postData.thumbnailUrl = postData.imageUrl = await this.filesUploadService.uploadFileToS3Minio(
            file.buffer,
            file.originalname,
            userId,
          );
        } else {
          throw new HttpException(
            'When image type is set only .png or .jpeg extensions is accept',
            400,
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
      postResult = await this.postsRepository.createOrUpdatePost(
        postData,
      );

      if (
        postData.addressCountryCode &&
        postData.addressState &&
        postData.addressCity
      ) {
        let city = await this.citiesService.getCity(
          postData.addressCity,
          postData.addressState,
          postData.addressCountryCode,
        );
        if (!city) {
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

        postResult.addressId = address.id;

        await queryRunner.manager.save(address);
      }

      await queryRunner.manager.save(postResult);

      if (postData.tagsIds && postData.tagsIds.length > 0) {
        const tagsIds = postData.tagsIds.split(',');
        await this.interestsTagsService.updatePostTags(
          postResult.id,
          tagsIds,
          queryRunner,
        );
      }

      await queryRunner.commitTransaction();

    } catch (err) {
      await queryRunner.rollbackTransaction();
      await this.postsRepository.deletePost(postData.id);
    } finally {
      await queryRunner.release();
      if (postResult) {
        if (postResult.type === 'image') {
          let transfer = await this.sendRewardToCreatorForPostPhoto(postResult.id);
          postResult.oozGenerated = transfer.balance;
        } else {
          const totalOOZ = (await this.calcOOZToTransferForPostVideos()).toFixed(1);
          postResult.oozGenerated = totalOOZ;
        }
      } else {
        throw new HttpException("Error when create post", 400);
      }

      return postResult;
    }
  }

  async createPostGallery(postData, userId) {
    postData.id = uuidv4();
    postData.type = 'gallery'

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      var postResult: any = null;
      postData.userId = userId;
      postResult = await this.postsRepository.createOrUpdatePost(
        postData,
      );
      for (const id of postData.mediaIds) {
        await this.mediasRepository.updatePostIdInMedia(postData.id, id);
      }
      if (
        postData.addressCountryCode &&
        postData.addressState &&
        postData.addressCity
      ) {
        let city = await this.citiesService.getCity(
          postData.addressCity,
          postData.addressState,
          postData.addressCountryCode,
        );
        if (!city) {
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

        postResult.addressId = address.id;

        await queryRunner.manager.save(address);
      }
      await queryRunner.manager.save(postResult);
      if (postData.tagsIds && postData.tagsIds.length > 0) {
        await this.interestsTagsService.updatePostTags(
          postResult.id,
          postData.tagsIds,
          queryRunner,
        );
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      await this.postsRepository.deletePost(postData.id);
    } finally {
      await queryRunner.release();
      if (postResult) {
        let verify = await this.mediasRepository.verifyMediasStatus(postData.mediaIds)
        if (verify) {
          await this.postsRepository.updatePostStatus(postData.id, 'ready')
          if (postData.taggedUsersId && postData.taggedUsersId.length) {
            await this.sendNotificationToTaggedUser(postData.id, postData.userId, postData.taggedUsersId)
          }
          let transfer = await this.sendRewardToCreatorForPostPhoto(postResult.id);
          postResult.oozGenerated = transfer.balance;
        } else {
          await this.postsRepository.updatePostStatus(postData.id, 'unready')
          postResult.oozGenerated = 0
        }
        // if (postResult.type === 'gallery') {
          
        // }
        //else {
        //   await this.sendRewardToCreatorForPostPhoto(postResult.id);
        //   const totalOOZ = (await this.calcOOZToTransferForPostVideos()).toFixed(1);
        //   postResult.oozGenerated = totalOOZ;
        // }
      } else {
        throw new HttpException("Error when create post", 400);
      }

      return postResult;

    }
  }

  async sendFile(file, user, type) {
    if (type === 'image') {
      const imagesAcceptTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/octet-stream'];
      if (imagesAcceptTypes.includes(file.mimetype)) {
        let fileUploaded = await this.filesUploadService.uploadFileToS3Minio(
          file.buffer,
          file.originalname,
          user.id,
        );

        let savedFile = await this.mediasRepository.createOrUpdateMedia(
          { type: 'image', mediaUrl: fileUploaded, thumbnailUrl: fileUploaded, status: "ready" }
        )
        return { mediaId: savedFile.id }
      } else {
        throw new HttpException(
          'When image type is set only .png or .jpeg extensions is accept',
          400,
        );
      }
    } else {
      let fileUploaded: any = await this.videoService.uploadVideo(
        file.buffer,
        user.id,
      );
      let savedFile = await this.mediasRepository.createOrUpdateMedia(
        {
          type: 'video',
          mediaUrl: fileUploaded.playback.hls,
          thumbnailUrl: fileUploaded.thumbnail,
          streamMediaId: fileUploaded.uid,
          status: "unready"
        }
      )
      return { mediaId: savedFile.id }
    }
  }

  async getPostById(id: string) {
    let post = await this.postsRepository.getPostById(id);
    if (!post.thumbnailUrl) {
      post.thumbnailUrl = post.medias[0].thumbUrl
    }
    return post
  }

  async getPostShareLink(id: string) {
    let post = await this.postsRepository.getPostById(id);
    let user = await this.usersService.getUserById(<any>post.userId);

    return this.linksService.linkForShared({
      title: user.fullname,
      description: post.description,
      imageUrl: post.thumbnailUrl,
      thumbnail: {
        id: post.type == 'video' ? id : null,
        type: post.type == 'video' ? 'posts' : null
      }
    });
  }

  async geThumbnailVideo(type: string, id: string) {
    let post = await this.postsRepository.getPostById(id);
    const response = await this.httpService.axiosRef({
      url: post.thumbnailUrl,
      method: "GET",
      responseType: 'arraybuffer'
    });

    const image = await jimp.read(response.data);
    const logo = await jimp.read('src/assets/play.png');
    image.composite(await logo, image.getWidth() / 2 - 45, image.getHeight() / 2 - 45, {
      mode: jimp.BLEND_SOURCE_OVER,
      opacityDest: 1,
      opacitySource: 1
    });
    return image.getBufferAsync(image.getMIME());
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
    } finally {
      await queryRunner.release();
    }
  }

  //Se rewardToCreator for true, uma recompensa em OOZ será transferida ao criador a cada 60 segundos do vídeo postado se o novo status do video for "ready"

  async updatePostVideoStatus(
    streamMediaId: string,
    status: string,
    duration: number,
    rewardToCreator?: boolean,
  ) {
    const media = await this.mediasRepository.getMediaByStreamMediaId(streamMediaId);
    if (media) {
      await this.mediasRepository.updateMedia(media.id, status, duration)
      if (media.postId) {
        const post = await this.mediasRepository.getMediasByStreamMediaId(streamMediaId)
        let verify = await this.mediasRepository.verifyMediasStatus(post.mediaIds)
        if (verify) {
          await this.postsRepository.updatePostStatus(post.id, 'ready')
          await this.sendRewardToCreatorForPostPhoto(media.postId);
          if (post.taggedUsersId && post.taggedUsersId.length) {
            await this.sendNotificationToTaggedUser(post.id, post.userId, post.taggedUsersId)
          }
        }
      }
      return media
    } else {
      const post = await this.postsRepository.getPostByStreamMediaId(
        streamMediaId,
      );
      if (!post) {
        return null;
      }
      if (post.videoStatus == 'ready') {
        return post;
      }
      post.videoStatus = status;
      post.durationInSecs = duration;
      const result = await this.postsRepository.createOrUpdatePost(post);
      if (rewardToCreator && status == 'ready') {
        await this.sendRewardToCreatorForPost(post.id);
      }
      return result;
    }
  }

  async calcOOZToTransferForPostVideos() {
    const oozToReward = +(
      await this.generalConfigService.getConfig(
        ConfigName.CREATOR_REWARD_PER_MINUTE_OF_POSTED_VIDEO,
      )
    ).value;
    return oozToReward;
  }

  async sendRewardToCreatorForPost(postId: string) {
    const post = await this.getPostById(postId);
    const totalOOZ = await this.calcOOZToTransferForPostVideos();

    const receiverUserWalletId = (
      await this.walletsService.getWalletByUserId(post.userId)
    ).id;

    await this.walletTransfersService.createTransfer(
      post.userId,
      {
        userId: post.userId,
        walletId: receiverUserWalletId,
        balance: totalOOZ,
        postId: postId,
        origin: Origin.POSTED_VIDEOS,
        action: WalletTransferAction.RECEIVED,
        processed: false,
        fromPlatform: true,
      },
      false,
    );

    await this.usersService.updateAccumulatedOOZInDeviceUser(<any>post.userId);
  }

  async sendRewardToCreatorForPostPhoto(postId: string) {
    const post = await this.getPostById(postId);
    const oozToReward = +(
      await this.generalConfigService.getConfig(
        ConfigName.OOZ_BY_POST,
      )
    ).value;
    const receiverUserWalletId = (
      await this.walletsService.getWalletByUserId(post.userId)
    ).id;

    return await this.walletTransfersService.createTransfer(
      post.userId,
      {
        userId: post.userId,
        walletId: receiverUserWalletId,
        balance: oozToReward,
        origin: Origin.POSTED_PHOTOS,
        action: WalletTransferAction.RECEIVED,
        processed: false,
        fromPlatform: true,
      },
      false,
    );
  }

  async getPostsTimeline(filters, userId?: string) {
    return (await this.postsRepository.getPostsTimeline(filters, userId)).map(post => {
      if (post.type == 'gallery') {
        let media = post.medias[0];
        if (media.type == 'image') {
          post.imageUrl = media.mediaUrl;
          post.thumbnailUrl = media.mediaUrl;
        }
        if (media.type == 'video') {
          post.videoUrl = media.mediaUrl;
          post.thumbnailUrl = media.thumbUrl;
        }
        post.type = media.type
      }
      return post
    })
  }

  async getPostsTimelineV2(filters, userId?: string) {
    return this.postsRepository.getPostsTimeline(filters, userId);
  }

  async deletePost(postId, userId) {
    const result = await this.postsRepository.deletePostByUser(postId, userId);
    if (result.type === 'video') {
      await this.videoService.deleteVideo(result.streamMediaId);
    }
  }

  incrementOOZTotalCollected(balance: number, postId: string) {
    return this.postsRepository.incrementOOZTotalCollected(balance, postId);
  }

  async countPostUserRewarded(postId: string, userId: string, oozRewarded: number) {
    return await this.postsUsersRewardedRepository.countReward(postId, userId, oozRewarded);
  }

  async sendNotificationToTaggedUser(postId, postUserId, usersTaggedsId) {
    let [userPost, usersTokenTagged] = await Promise.all([
      this.usersService.getUserById(postUserId),
      this.usersDeviceTokenService.getByUsersId(usersTaggedsId),
    ]);
    let notifications = usersTokenTagged.filter(user => !!user)
      .map((user: any) =>
      ({
        token: user.deviceToken,
        data: {
          type: "user-tagged-in-post",
          postId: postId,
          usersName: <any>JSON.stringify([userPost.fullname])
        }
      })
      )
    if (notifications.length) {
      await this.notificationMessagesService.sendFirebaseMessages(notifications);
    }
  }
}
