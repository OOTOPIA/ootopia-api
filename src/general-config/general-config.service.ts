import { Injectable } from '@nestjs/common';
import { GeneralConfigRepository } from './general-config.repository';

@Injectable()
export class GeneralConfigService {

    constructor(
        private readonly generalConfigRepository : GeneralConfigRepository
    ) {}

    async getConfig(name : string) {
        let config = await this.generalConfigRepository.getConfig(name);
        if (!config) {
            return null;
        }
        return {
            name : config.name,
            value : config.value
        };
    }

    async getAllConfigs() {
        let configs = await this.generalConfigRepository.getAllConfigs();
        let config : any = {};
        
        configs.forEach((c) => {
            config[c.name] = c.value;
        })

        return config;
    }

}
