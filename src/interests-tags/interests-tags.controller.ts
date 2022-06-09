import { Controller, Get, HttpException, Query, Req, UseInterceptors, Body, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiExcludeEndpoint, ApiParam, ApiTags } from '@nestjs/swagger';
import { ErrorHandling } from './../config/error-handling';
import { HttpResponseDto } from './../config/http-response.dto';
import { FilterInterestsTagsDto, InterestsTagsDto, CreateTagDto, FilterSearchHashtagDto } from './interests-tags.dto';
import { InterestsTagsService } from './services/interests-tags.service';
import { SentryInterceptor } from '../interceptors/sentry.interceptor';

@Controller('interests-tags')
export class InterestsTagsController {

    constructor(
        private readonly interestsTagsService: InterestsTagsService) { }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('interests-tags')
    @ApiQuery({ name: "language", type: "string", example: "pt-BR" })
    @ApiOperation({ summary: 'Returns a list of tags' })
    @ApiResponse({ status: 200, type: InterestsTagsDto, isArray: true })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: 'Internal Server Error', type: HttpResponseDto })
    @Get()
    async getTags(@Query() filters: FilterInterestsTagsDto) {
        try {

            return await this.interestsTagsService.getTags(filters.language);

        } catch (error) {
            new ErrorHandling(error);
        }
    }
    @UseInterceptors(SentryInterceptor)
    @ApiTags('interests-tags')
    @ApiBody({type: CreateTagDto })
    @ApiOperation({ summary: 'Create new hashtag' })
    @ApiResponse({ status: 200, type: InterestsTagsDto, isArray: true })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: 'Internal Server Error', type: HttpResponseDto })
    @Post()
    async createTags(@Body() data: CreateTagDto) {
        try {

            return await this.interestsTagsService.createTag(data);

        } catch (error) {
            new ErrorHandling(error);
        }
    }
    @UseInterceptors(SentryInterceptor)
    @ApiTags('interests-tags')
    @ApiQuery({ name: "name", type: "string", example: "123", required: false })
    @ApiQuery({ name: "language", type: "string", example: "pt-BR", required: false })
    @ApiQuery({ name: "page", type: "number", example: "1" })
    @ApiQuery({ name: "limit", type: "number", example: "50" })
    @ApiOperation({ summary: 'Returns a list of tags' })
    @ApiResponse({ status: 200, type: InterestsTagsDto, isArray: true })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: 'Internal Server Error', type: HttpResponseDto })
    @Get('/search')
    async searchTag(@Query() data: FilterSearchHashtagDto) {
        try {

            return await this.interestsTagsService.searchTag(data);

        } catch (error) {
            new ErrorHandling(error);
        }
    }

}
