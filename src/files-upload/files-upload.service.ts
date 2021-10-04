import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as Minio from 'minio';
import { nanoid } from 'nanoid';

@Injectable()
export class FilesUploadService {
  private aws;
  private awsMinio;

  constructor() {
    this.aws = new AWS.S3({
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      region: process.env.S3_REGION,
      params: {
        Bucket: process.env.S3_BUCKET,
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
        Bucket: process.env.S3_BUCKET,
        ACL: 'public-read',
      })
      .promise();

    return Location;
  }

  async uploadLearningTrackImageToS3(fileStreamOrBuffer, fileName) {
    const extension = /(?:\.([^.]+))?$/.exec(fileName)[0];
    const { Location } = await this.aws
      .upload({
        Key: `learning-tracks/image-${nanoid(10)}-${new Date().getTime()}${extension}`,
        Body: fileStreamOrBuffer,
        Bucket: process.env.S3_BUCKET,
        ACL: 'public-read',
      })
      .promise();

    return Location;
  }

  async uploadFileToS3Minio(fileStreamOrBuffer, fileName, userId) {
    const extension = /(?:\.([^.]+))?$/.exec(fileName)[0];
    const name = `users/${userId}/photo-${new Date().getTime()}${extension}`;
    const metaData = {
      'x-amz-acl': 'public-read',
    };
    try {
      await this.awsMinio.putObject(
        process.env.S3_BUCKET,
        name,
        fileStreamOrBuffer,
        metaData,
      );
    } catch (error) {
      throw error;
    }

    return `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${name}`;
  }
}
