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

        let limit = 50, 
            offset = 0, 
            where = 'deleted_at IS NULL AND u.banned_at is null AND ', 
            locale = "en",
            params = [];

        let columns = [
            'm.*', 
            'u.fullname as user_name', 
            'u.photo_url as user_photo_url',
        ];

        if (filters.limit) {
            if (filters.limit > 50) {
                filters.limit = 50;
            }
            limit = filters.limit;
            offset = filters.offset || 0;
        }

        // if (filters.locale) {
        //     params.push(filters.locale);
        //     where += `locale = $${params.length} AND `;
        // }else{
        //     params.push(locale);
        //     where += `locale = $${params.length} AND `;
        // }

        where = where.substring(0, where.length - 5);

        return camelcaseKeys(await getConnection().query(`
            SELECT ${columns},
            array(
                select json_build_object('id', it.id, 'name', it.name , 'language', it.language) as medias
              from interests_tags it
              where it.strapi_id = any(m.hashtags_strapi_id)
            ) as hashtags 
            FROM market_place_products m
            LEFT JOIN users u ON u.id = m.user_id
            WHERE ${where}
            ORDER BY m.strapi_id DESC
            LIMIT ${limit} OFFSET ${offset}
        `, params), { deep : true });

    }

    async getById(id : string) {
        return camelcaseKeys(await getConnection().query(`
            SELECT m.*, u.fullname as "user_name", u.photo_url as "user_photo_url" FROM market_place_products m
            LEFT JOIN users u ON u.id = m.user_id
            WHERE m.id = $1 and m.deleted_at is null
        `, [id]))[0];
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
    async adminDeleteLearningTrack(id: string) {
        const data = await this.findOne({
            where: {
                id
            }
        });
        if (!data) {
            throw new HttpException("Market Place not found", 404);
        }
        data.deletedAt = new Date();
        return await this.save(data);
    }

}