import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection, IsNull } from "typeorm";
import * as camelcaseKeys from 'camelcase-keys';
import { MarketPlaceProducts } from "./entities/market-place-products.entity";
import { MarketPlaceDto, MarketPlaceFilterDto} from "./dto/create-market-place.dto";

@Injectable()
@EntityRepository(MarketPlaceProducts)
export class MarketPlaceRepository extends Repository<MarketPlaceProducts>{

    constructor(
    ) {
        super();
    }

    createOrUpdate(marketPlaceData) {
        const marketPlace = this.create();
        Object.assign(marketPlace, marketPlaceData);
        return this.save(marketPlace);
    }

    async getMarketPlaceProducts(filters : MarketPlaceFilterDto) {

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
        
        return await this.createQueryBuilder()
            .where(where)
            .orderBy("strapi_id", "DESC")
            .limit(limit)
            .offset(offset)
            .getMany();

    }

    async getById(id : string) {
        return await this.findOne({
            where : { id, deletedAt : IsNull() }
        });
    }

    async getByStrapiId(strapiId? :number) {
        return await this.findOne({
            where : { strapiId }
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
            return;
        }
        data.deletedAt = new Date();
        return await this.save(data);
    }

}