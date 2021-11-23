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
        return await this.generalConfigRepository.getAllConfigs();
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

    getIosHasNotch(iosScreenSize : number) {
        return ((iosScreenSize == 812 ||
            iosScreenSize == 812 * 2 ||
            iosScreenSize == 812 * 3 ||
            iosScreenSize == 896 ||
            iosScreenSize == 896 * 2 ||
            iosScreenSize == 896 * 3 ||
            // iPhone 12 pro
            iosScreenSize == 844 ||
            iosScreenSize == 844 * 2 ||
            iosScreenSize == 844 * 3 ||
            // Iphone 12 pro max
            iosScreenSize == 926 ||
            iosScreenSize == 926 * 2 ||
            iosScreenSize == 926 * 3));
    }

}
