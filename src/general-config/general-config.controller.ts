import { Controller, Get, HttpException, Query, Req, UseInterceptors, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiExcludeEndpoint, ApiParam, ApiTags } from '@nestjs/swagger';
import { ErrorHandling } from './../config/error-handling';
import { HttpResponseDto } from './../config/http-response.dto';
//import { FilterInterestsTagsDto, InterestsTagsDto } from './interests-tags.dto';
import { GeneralConfigService } from './general-config.service';
import { SentryInterceptor } from '../interceptors/sentry.interceptor';
import { GeneralConfig } from './general-config.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GeneralConfigDto, GeneralConfigIosHasNotchDto } from './general-config.dto';

@Controller('general-config')
export class GeneralConfigController {

    constructor(
        private readonly generalConfigService : GeneralConfigService) {}

    @UseInterceptors(SentryInterceptor)
    @ApiTags('general-config')
    @ApiOperation({ summary: 'Check if ios version has notch' })
    @ApiResponse({ status: 200, type: GeneralConfigDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: 'Internal Server Error', type: HttpResponseDto })
    @Get('/check-ios-has-notch')
    async getIosHasNotch(@Query() query : GeneralConfigIosHasNotchDto) {
        try {

            return {
                hasNotch : this.generalConfigService.getIosHasNotch(query.iosScreenSize),
            };
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('general-config')
    @ApiParam({ name : "name", type: "string", description: "Name of the configuration you want to get the value" })
    @ApiOperation({ summary: 'Get a configuration value' })
    @ApiResponse({ status: 200, type: GeneralConfigDto })
    @ApiResponse({ status: 404, description: 'Configuration not found', type: HttpResponseDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: 'Internal Server Error', type: HttpResponseDto })
    @Get('/:name')
    async getConfig(@Param('name') name) {
        try {

            let config = await this.generalConfigService.getConfig(name);

            if (!config) {
                throw new HttpException("Not found", 404);
            }

            return config;
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('general-config')
    @ApiOperation({ summary: 'Get all configurations' })
    @ApiResponse({ status: 200, type: GeneralConfig })
    @ApiResponse({ status: 404, description: 'Configuration not found', type: HttpResponseDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: 'Internal Server Error', type: HttpResponseDto })
    @Get()
    async getAllConfigs() {
        try {

            return await this.generalConfigService.getAllConfigs();
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }

}
