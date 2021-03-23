import { Injectable } from '@nestjs/common';
import { CitiesRepository } from './cities.repository';

@Injectable()
export class CitiesService {

    constructor(
        private readonly citiesRepository : CitiesRepository) {
    }

    async createCity(cityData) {
        return await this.citiesRepository.createCity(cityData);
    }

    async getCity(city, state, country) {
        return await this.citiesRepository.getCity(city, state, country);
    }

}
