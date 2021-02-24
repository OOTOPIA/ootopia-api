import { Injectable } from '@nestjs/common';
import { VideoService } from 'src/video/video.service';
import { PostsRepository } from './posts.repository';

@Injectable()
export class PostsService {

    constructor(private readonly postsRepository : PostsRepository, private readonly videoService : VideoService) {

    }

    async createPost(fileBuffer, postData) {

      let video : any = await this.videoService.uploadVideo(fileBuffer, postData.description);

      postData.videoUrl = video.playback.hls;
      postData.thumbnailUrl = video.thumbnail;
      postData.streamMediaId = video.uid;

      return this.postsRepository.createOrUpdatePost(postData);
     
    }

    likePost(postId, userId) {
      return this.postsRepository.likePost(postId, userId);
    }

    updatePostVideoStatus(streamMediaId : string, status : string) {
      return this.postsRepository.updatePostVideoStatus(streamMediaId, status)
    }

}
