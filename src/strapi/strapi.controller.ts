import { Controller, Get, Post, Body, HttpException, Param, Query, Req, UseInterceptors, UseGuards, HttpCode, Headers } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiExcludeEndpoint, ApiParam, ApiTags } from '@nestjs/swagger';
import { SentryInterceptor } from '../interceptors/sentry.interceptor';
import { ErrorHandling } from './../config/error-handling';
import { HttpResponseDto } from './../config/http-response.dto';
import { StrapiService } from './strapi.service';

@Controller('strapi')
export class StrapiController {

    constructor(private readonly strapiService : StrapiService){};

    @ApiExcludeEndpoint()
    @UseInterceptors(SentryInterceptor)
    @ApiTags('strapi')
    @ApiOperation({ summary: "Strapi webhook" })
    @ApiResponse({ status: 200 })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: 'Internal Server Error', type: HttpResponseDto })
    @Post('/webhook')
    async webhook(@Headers() headers, @Body() data) {
        try {
            if (!headers || !headers['authorization'] || headers['authorization'] != process.env.STRAPI_WEBHOOK_AUTH) {
                throw new HttpException("Permission denied", 403);
            }
            
            return await this.strapiService.webhook(data);
        } catch (error) {
            new ErrorHandling(error);
        }
    }
}
