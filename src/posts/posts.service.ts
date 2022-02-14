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

@Injectable()
export class PostsService {
  constructor(
    private readonly httpService  : HttpService,
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
    @Inject(forwardRef(() => WalletTransfersService))
    private readonly walletTransfersService: WalletTransfersService,
  ) {}

  async createPost(file, postData, userId) {
    postData.id = uuidv4();

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      var postResult : any = null;
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
        if(postResult.type === 'image'){
          let transfer = await this.sendRewardToCreatorForPostPhoto(postResult.id);
          postResult.oozGenerated = transfer.balance;
        }else{
          const totalOOZ = (await this.calcOOZToTransferForPostVideos()).toFixed(1);
          postResult.oozGenerated = totalOOZ;
        }
      }else{
        throw new HttpException("Error when create post", 400);
      }

      return postResult;
    }
  }

  getPostById(id: string) {
    return this.postsRepository.getPostById(id);
  }

  async getPostShareLink(id: string) {
    let post = await this.postsRepository.getPostById(id);
    let user = await this.usersService.getUserById(<any>post.userId);
    
    return this.linksService.linkForShared({
      title: user.fullname,
      description: post.description,
      imageUrl : post.thumbnailUrl,
      thumbnail: {
        id: post.type == 'video'? id : null,
        type: post.type == 'video'? 'posts' : null
      }
    });
  }

  async geThumbnailVideo(type: string, id: string) {
    let post = await this.postsRepository.getPostById(id);
    const response = await this.httpService.axiosRef({
      url: post.thumbnailUrl,
      method:"GET",
      responseType: 'arraybuffer'
    });

    const image = await jimp.read(response.data);
    const logo = await jimp.read('src/assets/play.png');
    // const imageMetadata = await image.metadata();
    // const width = (imageMetadata.width / 2);
    // const height = (imageMetadata.height / 2);
    // console.log('size image ', width, height);
    logo.resize(90,90);
    // logo.resize({ sharp
    //   fit: sharp.fit.contain,
    //   width: 90,
    //   height: 90,
    // });
    
    image.composite(await logo, image.getWidth()/ 2 - 45, image.getHeight() / 2 - 45, {
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
    rewardToCreator?: boolean,
  ) {
    const videoDetails = (
      await this.videoService.getVideoDetails(streamMediaId)
    ).result;
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
    post.durationInSecs = +videoDetails.duration;
    const result = await this.postsRepository.createOrUpdatePost(post);
    if (rewardToCreator && status == 'ready') {
      await this.sendRewardToCreatorForPost(post.id);
    }
    return result;
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
        ConfigName.CREATOR_REWARD_FOR_POSTED_PHOTO,
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
    return this.postsRepository.getPostsTimeline(filters, userId);
  }

  async deletePost(postId, userId) {
    const result = await this.postsRepository.deletePostByUser(postId, userId);
    if(result.type === 'video'){
      await this.videoService.deleteVideo(result.streamMediaId);
    }
  }

  incrementOOZTotalCollected(balance: number, postId: string) {
    return this.postsRepository.incrementOOZTotalCollected(balance, postId);
  }

  async countPostUserRewarded(postId : string, userId : string, oozRewarded : number) {
    return await this.postsUsersRewardedRepository.countReward(postId, userId, oozRewarded);
  }
}
