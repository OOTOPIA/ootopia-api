import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import { GeneralConfig } from "./general-config.entity";
import * as camelcaseKeys from 'camelcase-keys';


@Injectable()
@EntityRepository(GeneralConfig)
export class GeneralConfigRepository extends Repository<GeneralConfig>{

    constructor() {
        super();
    }

    getConfig(name : string) {
        return this.findOne({
            where: { name }
        });
    }

    async getAllConfigs() {
        return (await getConnection().query("select name, value from general_config where name != $1", ['global_goal_limit_time_in_utc'])).map((config) => {
            //config.value = +config.value;
            return config;
        });
    }

}