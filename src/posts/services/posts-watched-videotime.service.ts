import { HttpException, Injectable } from '@nestjs/common';
import { PostWatchedVideoTimeDto } from '../posts.dto';
import { PostsWatchedVideotimeRepository } from '../repositories/posts-watched-videotime.repository';

@Injectable()
export class PostsWatchedVideotimeService {

    constructor(private readonly postsWatchedVideotimeRepository : PostsWatchedVideotimeRepository) {

    }

    async recordWatchedVideotime(postId : string, data) {

        if (!postId || !data) {
            throw new HttpException('Post ID is mandatory', 400);
        }
        
        let result, postWatchedVideotime = await this.postsWatchedVideotimeRepository.getPostWatchedVideotimeById(postId);
        
        if (!postWatchedVideotime) {
            result = await this.postsWatchedVideotimeRepository.recordWatchedVideotime(data);
        }else{
            postWatchedVideotime.timeInMilliseconds = +postWatchedVideotime.timeInMilliseconds + (+data.timeInMilliseconds);
            result = await this.postsWatchedVideotimeRepository.recordWatchedVideotime(postWatchedVideotime);
        }

        return result;
        
    }

}
