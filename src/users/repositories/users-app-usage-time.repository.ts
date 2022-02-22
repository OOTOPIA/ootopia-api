import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import * as camelcaseKeys from 'camelcase-keys';
import { UsersAppUsageTime } from "../entities/users-app-usage-time.entity";

@Injectable()
@EntityRepository(UsersAppUsageTime)
export class UsersAppUsageTimeRepository extends Repository<UsersAppUsageTime>{

    constructor() {
        super();
    }

    async recordAppUsageTime(data) {
        const appUsageTime = this.create();
        Object.assign(appUsageTime, data);
        return await this.save(appUsageTime);
    }

    async getUsersIdsWhoUsedAppInThisPeriod(startDateTime : Date, page : number) {
        let perPage = 100,
            limit = 'LIMIT ' + perPage + ' OFFSET ' + ((page > 1 ? page - 1 : 0) * perPage);

        return camelcaseKeys(await getConnection().query(`
            SELECT * FROM (
                SELECT user_id FROM users_app_usage_time WHERE created_at BETWEEN $1 and now() at time zone 'UTC'
            ) t 
            GROUP BY t.user_id
            ${limit}
        `, [startDateTime]), { deep : true });
    }

    async getTimeSumOfUserUsedAppInThisPeriod(userId : string, startDateTime : Date,
        endDateTime : Date) {
        return camelcaseKeys(await getConnection().query(`
            SELECT sum(time_in_milliseconds) FROM users_app_usage_time 
            WHERE user_id = $1 AND created_at BETWEEN $2 and $3;
        `, [userId, startDateTime.toISOString(), endDateTime.toISOString()]), { deep : true });
    }

}