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

}