import { Injectable } from '@nestjs/common';
import { MarketPlaceByIdDto, MarketPlaceDto } from './dto/create-market-place.dto';
import { MarketPlaceRepository } from './market-place.repository';
import * as moment from 'moment-timezone';
import { FilesUploadService } from 'src/files-upload/files-upload.service';
import * as Axios from 'axios';

const axios = Axios.default;

@Injectable()
export class MarketPlaceService {

  constructor(
    private marketPlaceRepository: MarketPlaceRepository,
    private filesUploadService : FilesUploadService,
  ) {}

  async createOrUpdate(marketPlaceData, strapiEvent : string) {
    let findMarketPlace = await this.marketPlaceRepository.getByStrapiId(marketPlaceData.id);

    if (strapiEvent == "entry.update" && (!findMarketPlace || !marketPlaceData.published_at)) { 
        //Não vamos fazer nada se houver atualização sem que o dado esteja registrado no banco e publicado no strapi
        return;
    }

    let uploadNewImage = marketPlaceData.photo != null;
    let photoUrl = marketPlaceData.photo ? (marketPlaceData.photo.formats?.large?.url || marketPlaceData.photo.formats?.medium?.url || marketPlaceData.photo.formats?.small?.url) : ""; 
    let imageUrl = marketPlaceData.photo ? `${process.env.STRAPI_URL}${photoUrl}` : "";

    if (findMarketPlace) {
        let strapiId = marketPlaceData.id;
        uploadNewImage = marketPlaceData.photo && moment(marketPlaceData.photo.updated_at) > moment(findMarketPlace.imageUpdatedAt);
        marketPlaceData.id = findMarketPlace.id;
        marketPlaceData.strapiId = strapiId;
    } else {
      marketPlaceData.strapiId = marketPlaceData.id;
      delete marketPlaceData.id;
    }

    if (uploadNewImage && imageUrl) {
        let fileBuffer = (await axios.get(imageUrl, { responseType : 'arraybuffer' })).data;
        imageUrl = await this.filesUploadService.uploadLearningTrackImageToS3(fileBuffer, imageUrl);
    }

    let marketPlace : any = {
        id : marketPlaceData.id,
        strapiId : marketPlaceData.strapiId,
        userId : marketPlaceData.userId,
        title : marketPlaceData.title,
        description : marketPlaceData.description || "",
        locale : marketPlaceData.locale,
        imageUrl : imageUrl,
        imageUpdatedAt  : marketPlaceData.photo ? marketPlaceData.photo.updated_at : null,
        price : marketPlaceData.price,
        location : marketPlaceData.location || "",
        deletedAt : null,
        createdAt : marketPlaceData.created_at,
        updatedAt : marketPlaceData.updated_at,
    };

    console.log(' OPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', marketPlace);

    return
    return await this.marketPlaceRepository.createOrUpdate(marketPlace);
  }

  async deleteMarketPlaces(entryId) {
    await this.marketPlaceRepository.deleteMarketPlace(entryId);
  }

  async getLearningTracks(id : MarketPlaceByIdDto) {
    return await this.marketPlaceRepository.getByStrapiId(id);
  }
}
