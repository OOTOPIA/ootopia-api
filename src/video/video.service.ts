import { Injectable } from '@nestjs/common';
import * as tus from 'tus-js-client';
import * as Axios from 'axios';

const axios = Axios.default;

@Injectable()
export class VideoService {

    headers = null;
    
    constructor() {
      this.headers = {
        "X-Auth-Key": process.env.CLOUDFLARE_API_KEY,
        "X-Auth-Email": process.env.CLOUDFLARE_AUTH_EMAIL
      };
    }

    async uploadVideo(fileBuffer) {
      return new Promise((resolve, reject) => {

        //Upload here

        let size = Buffer.byteLength(fileBuffer);
        let mediaId = '';

        console.log("headers", this.headers);

        let options = {
          endpoint: `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream`,
          headers: this.headers,
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
          },
          onSuccess: async function () {
            console.log("Upload finished", mediaId);

            try {

              let result = await axios.get(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/${mediaId}`, {
                headers : this.headers
              });

              resolve(result.data.result);

            }catch(err) {
              //error on get uploaded video details
              reject(err);
            }
          },
          onAfterResponse: function (req, res) {
            return new Promise(_resolve => {
                var mediaIdHeader = res.getHeader("stream-media-id");
                if (mediaIdHeader) {
                    mediaId = mediaIdHeader;
                }
                _resolve(mediaId)
            })
          }
        };
        
        var upload = new tus.Upload(fileBuffer, options);
        upload.start();

      });
    }

}
