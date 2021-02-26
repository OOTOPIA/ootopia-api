import { HttpException, Injectable } from '@nestjs/common';
import * as tus from 'tus-js-client';
import * as Axios from 'axios';
import * as crypto from 'crypto';

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

    async uploadVideo(fileBuffer, name) {
      return new Promise((resolve, reject) => {

        //Upload here

        let size = Buffer.byteLength(fileBuffer);
        let mediaId = '';

        let options = {
          endpoint: `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream`,
          headers: this.headers,
          chunkSize: 50 * 1024 * 1024, // Required a minimum chunk size of 5MB, here we use 50MB.
          metadata: {
            name: name,
            thumbnailTimestampPct : "0.25"
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
          }.bind(this),
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

    async setWebhookAddress(url : string) {
      let result = await axios.put(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/webhook`, {
        notificationUrl : url
      }, {
        headers : this.headers
      });
      return result.data;
    }

    //TODO: VALIDATE WEBHOOK SIGNATURE
    async validateWebhookSignature(signature : string, requestBody) {

      let signatureSplit = signature.split(",");

      let time = signatureSplit[0].split("=")[1];
      let sig1 = signatureSplit[1].split("=")[1];

      let message = time + "." + requestBody;

      //var key = 'secret from the Cloudflare API';
      //var message = 'string from step 2';

      var hash = crypto.createHmac('sha256', process.env.CLOUDFLARE_API_KEY).update(message);

      let sig = hash.digest('hex');
      let compare = crypto.timingSafeEqual(Buffer.from(sig1), Buffer.from(sig));

      console.log("time", time, "sig1", sig1);
      console.log("concatenate", message);
      console.log("hash", test);
      console.log("Compare", compare);

      if (!compare) {
        throw new HttpException("SIGNATURE INVALID", 401);
      }

      return true;

    }



}
