import { HttpException, Injectable } from '@nestjs/common';
import { MarketPlaceByIdDto, MarketPlaceDto, MarketPlaceFilterDto } from './dto/create-market-place.dto';
import { MarketPlaceRepository } from './market-place.repository';
import * as moment from 'moment-timezone';
import { FilesUploadService } from 'src/files-upload/files-upload.service';
import * as Axios from 'axios';
import * as _ from 'lodash';
import { WalletTransfersService } from 'src/wallet-transfers/wallet-transfers.service';
import { EmailsService } from 'src/emails/emails.service';
import { UsersService } from 'src/users/users.service';
import { AddressesRepository } from 'src/addresses/addresses.repository';
import * as Sentry from '@sentry/node';
import { LinksService } from 'src/links/links.service';

const axios = Axios.default;

@Injectable()
export class MarketPlaceService {

  constructor(
    private marketPlaceRepository: MarketPlaceRepository,
    private linksService: LinksService,
    private filesUploadService : FilesUploadService,
    private walletTransfersService : WalletTransfersService,
    private emailsService: EmailsService,
    private usersService: UsersService,
  ) {}

  async createOrUpdate(marketPlaceData, strapiEvent : string) {
    
    let findMarketPlace = await this.marketPlaceRepository.getByStrapiId(marketPlaceData.id);

    if (strapiEvent == "entry.update" && (!findMarketPlace || !marketPlaceData.published_at)) {
        //Não vamos fazer nada se houver atualização sem que o dado esteja registrado no banco e publicado no strapi
        return;
    }

    let uploadNewImage = marketPlaceData.photo != null;
    let photoUrl = marketPlaceData.photo ? (
      marketPlaceData.photo.formats?.large?.url || 
      marketPlaceData.photo.formats?.medium?.url || 
      marketPlaceData.photo.formats?.small?.url || 
      marketPlaceData.photo.formats?.thumbnail?.url || 
      marketPlaceData.photo.formats?.url ||
      marketPlaceData.photo.url
    ) : ""; 
    
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
      hashtagsStrapiId: marketPlaceData.hashtagsStrapiId,
      location : marketPlaceData.location || "",
      deletedAt : null,
      createdAt : marketPlaceData.created_at,
      updatedAt : marketPlaceData.updated_at,
    };

    try {

      if (marketPlaceData.seller) {

        let user = await this.usersService.getUserByEmail(marketPlaceData.seller);

        if (user) {
          marketPlace.userId = user.id;
        }else{
          Sentry.captureMessage("There is no seller with this email: " + marketPlaceData.seller);
        }
      }
    }catch(e) {
      Sentry.captureException(e);
    }

    return await this.marketPlaceRepository.createOrUpdate(marketPlace);
  }

  async deleteMarketPlaces(entryId) {
    return await this.marketPlaceRepository.deleteMarketPlace(entryId);
  }

  async getMarketPlaceProducts(filters: MarketPlaceFilterDto) {
    let marketPlaceProducts = await this.marketPlaceRepository.getMarketPlaceProducts(filters);
    return marketPlaceProducts.map(this.mapper);
  }

  async getMarketPlaceProductById(id : string) {
    let marketPlaceProduct = await this.marketPlaceRepository.getById(id);
    
    if (!marketPlaceProduct) {
      return null;
    }

    return this.mapper(marketPlaceProduct);
  }

  async getMarketPlaceSharedLink(id: string) {
    let marketPlace = await this.getMarketPlaceProductById(id);
    
    return this.linksService.linkForShared({
      title: marketPlace.title,
      description: marketPlace.description,
      imageUrl: marketPlace.imageUrl
    });
  }

  async getMarketPlaceProductByStrapiId(id : number) {
    let marketPlaceProduct = await this.marketPlaceRepository.getByStrapiId(id);

    if (!marketPlaceProduct) {
      return null;
    }

    return this.mapper(marketPlaceProduct);
  }

  async purchase(marketPlaceProductId : string, userId : string, message) {
    
    let marketPlaceProduct = await this.getMarketPlaceProductById(marketPlaceProductId);

    if (!marketPlaceProduct) {
      throw new HttpException("PRODUCT_NOT_FOUND", 400);
    }
    let user = await this.usersService.getUserById(userId);
    if (!user.photoUrl) user.photoUrl = "https://ootopia-files.s3.amazonaws.com/assets/email/user.png";

    marketPlaceProduct.user = marketPlaceProduct && marketPlaceProduct.userId != 'ootopia'?
    await this.usersService.getUserById(marketPlaceProduct.userId) 
    : {
      fullname: "OOTOPIA",
      email: process.env.DEFAULT_MARKET_PLACE_SELLER_EMAIL || null,
      phone: process.env.DEFAULT_MARKET_PLACE_SELLER_PHONE || null,
      dialCode: process.env.DEFAULT_MARKET_PLACE_SELLER_DIALCODE || null,
      photoUrl: process.env.DEFAULT_MARKET_PLACE_SELLER_PHOTO || null,
      city: null,
      state: null,
    };
    
    marketPlaceProduct.message = message;

    await this.walletTransfersService.transferMarketPlacePurchase(user.id, marketPlaceProduct);
    
    await this.emailsService.sendConfirmMarketPlace(_.cloneDeep(marketPlaceProduct), _.cloneDeep(user) , true);
    
    await this.emailsService.sendConfirmMarketPlace(_.cloneDeep(marketPlaceProduct), _.cloneDeep(user) , false);
    

  }

  private mapper(marketPlaceProduct) {
    if (!marketPlaceProduct.userId) {
      marketPlaceProduct.userId = "ootopia";
      marketPlaceProduct.userName = "OOTOPIA";
      marketPlaceProduct.userPhotoUrl = "https://ootopia-files-staging.s3.sa-east-1.amazonaws.com/ootopia_marketplace_icon.png";
    }
    else if (!marketPlaceProduct.userPhotoUrl) {
      marketPlaceProduct.userPhotoUrl = "https://ootopia-files.s3.amazonaws.com/assets/email/user.png";
    }

    marketPlaceProduct.price = +marketPlaceProduct.price;
    return marketPlaceProduct;
  }
}
