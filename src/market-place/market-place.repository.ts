import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection, IsNull } from "typeorm";
import * as camelcaseKeys from 'camelcase-keys';
import { MarketPlace } from "./entities/market-place.entity";
import { MarketPlaceDto, MarketPlaceFilterDto} from "./dto/create-market-place.dto";

@Injectable()
@EntityRepository(MarketPlace)
export class MarketPlaceRepository extends Repository<MarketPlace>{

    constructor(
    ) {
        super();
    }

    createOrUpdate(marketPlaceData) {
        const marketPlace = this.create();
        Object.assign(marketPlace, marketPlaceData);
        return this.save(marketPlace);
    }

    getMarketPlaces(filters : MarketPlaceFilterDto) {

        let limit = 50, offset = 0, where : any = {deletedAt : IsNull(), }, locale = "en";

        if (filters.limit) {
            if (filters.limit > 50) {
                filters.limit = 50;
            }
            limit = filters.limit;
            offset = filters.offset || 0;
        }

        if (filters.locale) {
            where.locale = filters.locale;
        }else{
            where.locale = locale;
        }
        
        return this.createQueryBuilder("market-place")
            .where(where)
            .orderBy("strapi_id", "DESC")
            .limit(limit)
            .offset(offset)
            .getMany();

    }

    getByStrapiId(strapiId) {
        return this.findOne({
            where :{ strapiId }
        });
    }

    async deleteMarketPlace(strapiId) {
        if (!strapiId) {
            throw new HttpException("Permission denied (id not found)", 403);
        }
        const data = await this.findOne({
            where : {
                strapiId
            }
        });
        if (!data) {
            throw new HttpException("Permission denied", 403);
        }
        data.deletedAt = new Date();
        return await this.save(data);
    }

}