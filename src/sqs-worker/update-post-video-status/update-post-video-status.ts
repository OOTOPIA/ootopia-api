import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SqsMessageHandler } from "@ssut/nestjs-sqs";
import { PostsService } from 'src/posts/posts.service';

@Injectable()
export class UpdatePostVideoStatusHandlerService {

    constructor(
        @Inject(forwardRef(() => PostsService)) private readonly postsService : PostsService,
    ){}

    @SqsMessageHandler('update-post-video-status', false)
    public async handleMessage(message: AWS.SQS.Message) {
        try {
            let videoStatus : any = JSON.parse(message.Body);
            await this.postsService.updatePostVideoStatus(videoStatus.streamMediaId, videoStatus.status, videoStatus.duration, true)        
        }catch(err) {
            console.log(err)
            throw err;
        }
    }
}
