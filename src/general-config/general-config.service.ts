import { Injectable } from '@nestjs/common';
import { GeneralConfigRepository } from './general-config.repository';
import * as moment from 'moment-timezone';
import * as _ from 'lodash';

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

    getDailyGoalStartTime(_time : string) {
        let date = moment.utc(), time = moment.utc(_time, "HH:mm:ss");
        let dateCopy = _.cloneDeep(date, true);
        return moment.utc(dateCopy.set({
            hour:   time.get('hour'),
            minute: time.get('minute'),
            second: time.get('second')
        })).toDate();
    }

    getDailyGoalEndTime(_time : string) {
        let date = moment.utc().add(1, 'day'), time = moment.utc(_time, "HH:mm:ss");
        let dateCopy = _.cloneDeep(date, true);
        return moment.utc(dateCopy.set({
            hour:   time.get('hour'),
            minute: time.get('minute'),
            second: time.get('second')
        })).subtract(1, 'second').toDate();
    }

}
