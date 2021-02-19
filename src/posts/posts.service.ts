import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import * as tus from 'tus-js-client';

@Injectable()
export class PostsService {

    constructor(private readonly postsRepository : PostsRepository) {

    }

    async createPost(fileBuffer, postData) {

        //Upload here

        console.log("test", process.env.CLOUDFLARE_ACCOUNT_ID, postData);

        let size = Buffer.byteLength(fileBuffer);
        let mediaId = '';

        let options = {
            endpoint: `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream`,
            headers: {
              //'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
              "X-Auth-Key": process.env.CLOUDFLARE_API_KEY,
              "X-Auth-Email": process.env.CLOUDFLARE_AUTH_EMAIL,
            },
            chunkSize: 50 * 1024 * 1024, // Required a minimum chunk size of 5MB, here we use 50MB.
            //resume: true,
            metadata: {
              name: "video_teste",
              filename: "test.mp4",
              filetype: "video/mp4",
              //defaulttimestamppct: 0.5,
              //watermark: "$WATERMARKUID"
            },
            uploadSize: size,
            onError: function (error) {
              throw error;
            },
            onProgress: function (bytesUploaded, bytesTotal) {
              var percentage = (bytesUploaded / bytesTotal * 100).toFixed(2);
              console.log(bytesUploaded, bytesTotal, percentage + "%");
            },
            onSuccess: function () {
              console.log("Upload finished");
            },
            onAfterResponse: function (req, res) {
              return new Promise(resolve => {
                  var mediaIdHeader = res.getHeader("stream-media-id");
                  if (mediaIdHeader) {
                      mediaId = mediaIdHeader;
                  }
                  resolve(mediaId)
              })
            }
        };
        
        var upload = new tus.Upload(fileBuffer, options);
        upload.start();

        return await this.postsRepository.createOrUpdatePost(postData);
    }

}
