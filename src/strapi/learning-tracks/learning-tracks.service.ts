import { HttpException, HttpService, Injectable } from '@nestjs/common';
import { LearningTracksFilterDto } from 'src/learning-tracks/learning-tracks.dto';
import { LearningTracksInterface } from '../strapi.interface';
import * as Axios from 'axios';
import * as camelcaseKeys from 'camelcase-keys';

const axios = Axios.default;

@Injectable()
export class LearningTracksService implements LearningTracksInterface {

  apiUrl : string = process.env.STRAPI_URL;

  async getAll(filters: LearningTracksFilterDto) {
      try {
          
          if (!filters.offset) {
            filters.offset = 0;
          }
          if (!filters.limit) {
            filters.limit = 50;
          }
          let query = '';
          query += `_start=${filters.offset}&_limit=${filters.limit}`;

          return await axios
            .get(`${this.apiUrl}learning-tracks?${query}&_sort=id:DESC`)
            .then((response) => this.mapperAll(response.data));

      } catch (error) {
        console.log("this is error", error);
          throw new HttpException(error, 400);
      }
  }
  getById(id: number) {
    throw new Error('Method not implemented.');
  }
  
  mapper(data) {
    if (!data) {
      return null;
    }
    return this.mapperAll([data])[0];
  }

  mapperAll(data : any[]) {
    var apiUrl = this.apiUrl;
    return camelcaseKeys(data, {deep : true}).map(function (learningTrack) {
      
    }.bind(this));
  }
  
}
