import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as Minio from 'minio';

@Injectable()
export class FilesUploadService {
  private aws;
  private awsMinio;

  constructor() {
    this.aws = new AWS.S3({
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
      region: process.env.REGION,
      params: {
        Bucket: process.env.BUCKET,
        ACL: 'public-read',
      },
    });
    this.awsMinio = new Minio.Client({
      endPoint: 's3.amazonaws.com',
      accessKey: process.env.S3_ACCESS_KEY_ID,
      secretKey: process.env.S3_SECRET_ACCESS_KEY,
    });
  }

  async uploadFileToS3(fileStreamOrBuffer, fileName, userId) {
    const extension = /(?:\.([^.]+))?$/.exec(fileName)[0];
    const { Location } = await this.aws
      .upload({
        Key: `users/${userId}/photo-${new Date().getTime()}${extension}`,
        Body: fileStreamOrBuffer,
        Bucket: process.env.BUCKET,
        ACL: 'public-read',
      })
      .promise();

    return Location;
  }
  
  async uploadFileToS3Minio(fileStreamOrBuffer, fileName, userId) {
    const extension = /(?:\.([^.]+))?$/.exec(fileName)[0];
    const name = `users/${userId}/photo-${new Date().getTime()}${extension}`;
    try {
      await this.awsMinio.putObject(
        process.env.S3_BUCKET,
        name,
        fileStreamOrBuffer,
      );
    } catch (error) {
      throw error;
    }
    
    return `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${name}`;
  }
}
