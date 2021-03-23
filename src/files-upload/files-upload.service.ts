import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesUploadService {

  private aws;

  constructor() {
    this.aws = new AWS.S3({
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey:
        process.env.SECRET_ACCESS_KEY,
      region: process.env.REGION,
      params: {
        Bucket: process.env.BUCKET,
        ACL: 'public-read',
      },
    });
  }

  async uploadFileToS3(fileStreamOrBuffer, fileName, userId) {
    console.log("userId >>", userId);
    console.log("fileName >>", fileName);
    console.log("process.env >>", process.env);
    const extension = /(?:\.([^.]+))?$/.exec(fileName)[0];
    let { Location } = await this.aws
      .upload({
        Key: `users/${userId}/photo-${new Date().getTime()}${extension}`,
        Body: fileStreamOrBuffer,
        Bucket: process.env.BUCKET,
        ACL: 'public-read'
      })
      .promise();

      return Location;
  }

}
