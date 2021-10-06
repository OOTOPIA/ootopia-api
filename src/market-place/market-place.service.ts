import { Injectable } from '@nestjs/common';
import { MarketPlaceByIdDto, MarketPlaceDto, MarketPlaceFilterDto } from './dto/create-market-place.dto';
import { MarketPlaceRepository } from './market-place.repository';
import * as moment from 'moment-timezone';
import { FilesUploadService } from 'src/files-upload/files-upload.service';
import * as Axios from 'axios';
import { WalletsService } from 'src/wallets/wallets.service';

const axios = Axios.default;

@Injectable()
export class MarketPlaceService {

  constructor(
    private marketPlaceRepository: MarketPlaceRepository,
    private filesUploadService : FilesUploadService,
    private walletsService : WalletsService,
  ) {}

  async createOrUpdate(marketPlaceData, strapiEvent : string) {
    console.log('Comp cas pow saao');
    
    try {
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

    return await this.marketPlaceRepository.createOrUpdate(marketPlace);
  }
  catch(error) {
    console.log(error);
    return
  }
  }

  async deleteMarketPlaces(entryId) {
    await this.marketPlaceRepository.deleteMarketPlace(entryId);
  }

  async getMarketPlaceProducts(filters: MarketPlaceFilterDto) {

    // return await this.marketPlaceRepository.getByStrapiId(filters);
  }

  async getMarketPlaceProductById(id : string) {
    return await this.marketPlaceRepository.getById(id);
  }

  async getMarketPlaceProductByStrapiId(id : string) {
    return await this.marketPlaceRepository.getByStrapiId(id);
  }

  async purchase(marketPlaceId : string, userId : string) {
    let userWallet = await this.walletsService.getWalletByUserId(userId);
  }

  private mapper(learningTrack) {
    if (!learningTrack.userId) {
        learningTrack.userId = "ootopia";
        learningTrack.userName = "OOTOPIA Team";
        learningTrack.userPhotoUrl = "https://ootopia-files-staging.s3.sa-east-1.amazonaws.com/woman_pic.PNG";
    }
    learningTrack.ooz = +learningTrack.ooz;
    return learningTrack;
}
}
