import { Injectable } from '@nestjs/common';
import { AddressesRepository } from 'src/addresses/addresses.repository';
import { CitiesService } from 'src/cities/cities.service';
import { InterestsTagsService } from 'src/interests-tags/services/interests-tags.service';
import { VideoService } from 'src/video/video.service';
import { getConnection } from 'typeorm';
import { PostsRepository } from './posts.repository';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PostsService {

    constructor(
      private readonly postsRepository : PostsRepository, 
      private readonly videoService : VideoService,
      private readonly interestsTagsService : InterestsTagsService,
      private readonly citiesService : CitiesService,
      private readonly addressesRepository : AddressesRepository) {

    }

    async createPost(fileBuffer, postData, userId) {

      postData.id = uuidv4();

      let queryRunner = getConnection().createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {

        let video : any = await this.videoService.uploadVideo(fileBuffer, postData.description);

        postData.userId = userId;
        postData.videoUrl = video.playback.hls;
        postData.thumbnailUrl = video.thumbnail;
        postData.streamMediaId = video.uid;

        let postResult : any = await this.postsRepository.createOrUpdatePost(postData);

        if (postData.addressCountryCode && postData.addressState && postData.addressCity) {

          let city = await this.citiesService.getCity(postData.addressCity, postData.addressState, postData.addressCountryCode);
          if (!city) {
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

    likePost(postId, userId) {
      return this.postsRepository.likePost(postId, userId);
    }

    updatePostVideoStatus(streamMediaId : string, status : string) {
      return this.postsRepository.updatePostVideoStatus(streamMediaId, status)
    }

    getPostsTimeline(filters, userId? : string) {
      return this.postsRepository.getPostsTimeline(filters, userId);
    }

    async deletePost(postId, userId) {
      await this.postsRepository.deletePostByUser(postId, userId);
    }

}
