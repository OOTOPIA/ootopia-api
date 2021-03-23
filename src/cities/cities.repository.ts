import { Injectable } from "@nestjs/common";
import { EntityRepository, Repository } from "typeorm";
import { Cities } from "./cities.entity";

@Injectable()
@EntityRepository(Cities)
export class CitiesRepository extends Repository<Cities>{

    constructor() {
        super();
    }

    async createCity(cityData) {
        const city = this.create();
        Object.assign(city, cityData);
        return await this.save(city);
    }

    async getCity(city, state, country) {
        const cities = await this.find({
          where: { city, state, country },
        });
        return (cities && cities.length ? cities[0] : null);
    }

}