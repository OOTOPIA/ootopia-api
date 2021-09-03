import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import * as camelcaseKeys from 'camelcase-keys';
import { UsersTrophies } from "../entities/users-trophies.entity";

@Injectable()
@EntityRepository(UsersTrophies)
export class UsersTrophiesRepository extends Repository<UsersTrophies>{

    constructor() {
        super();
    }

    async createOrUpdateTrophy(trophyData) {
        if (!trophyData.userId || !trophyData.trophyType) {
            throw new HttpException("INVALID_TROPHY_DATA", 400);
        }
        let result = camelcaseKeys(await getConnection().query(`
            INSERT INTO users_trophies (user_id, trophy_type)
            SELECT $1, $2
            WHERE NOT EXISTS (
                SELECT * FROM users_trophies WHERE user_id = $1 AND trophy_type = $2
            )
            RETURNING *; 
        `, [
            trophyData.userId,
            trophyData.trophyType,
        ]), { deep : true });
        console.log('testing bro', result);
        if (!result || !result.length) {
            result = camelcaseKeys(await getConnection().query(`
                SELECT * FROM users_trophies WHERE user_id = $1 AND trophy_type = $2
            `, [
                trophyData.userId,
                trophyData.trophyType,
            ]), { deep : true });
            if (result && result.length) {
                await this.increaseTrophyQuantity(result[0].id);
            }
        }else{
            await this.increaseTrophyQuantity(result[0].id);
        }
        return result.length ? result[0] : null;
    }

    private async increaseTrophyQuantity(trophyId) {
        return camelcaseKeys(await getConnection().query(`
            UPDATE users_trophies SET 
                quantity = quantity+1,
                updated_at = now()
            WHERE 
                id = $1
            RETURNING *
        `, [
            trophyId
        ]), { deep : true });
    }

}