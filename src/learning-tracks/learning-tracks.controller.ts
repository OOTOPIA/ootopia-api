import { Controller, Get, Post, Body, HttpException, Param, Query, Req, UseInterceptors, UseGuards, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiExcludeEndpoint, ApiParam, ApiTags } from '@nestjs/swagger';
import { SentryInterceptor } from '../interceptors/sentry.interceptor';
import { ErrorHandling } from './../config/error-handling';
import { HttpResponseDto } from './../config/http-response.dto';
import { LastLearningTracksFilterDto, LearningTrackDto, LearningTracksFilterDto } from './learning-tracks.dto';
import { LearningTracksService } from './learning-tracks.service';

@Controller('learning-tracks')
export class LearningTracksController {

    constructor(private readonly learningTracksService: LearningTracksService) {}

    @UseInterceptors(SentryInterceptor)
    @ApiTags('learning-tracks')
    @ApiOperation({ summary: "Returns a list of Learning Tracks" })
    @ApiQuery({ name : "locale", type: "string", enum: ["en", "pt-BR"], required: true })
    @ApiQuery({ name : "limit", type: "number", description: "Limit of entries (50 max.)", required: false })
    @ApiQuery({ name : "offset", type: "number", required: false })
    @ApiResponse({ status: 200, type: LearningTrackDto, isArray: true })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: 'Internal Server Error', type: HttpResponseDto })
    @Get()
    async getLearningTracks(@Query() filters : LearningTracksFilterDto) {
        try {
            return await this.learningTracksService.getLearningTracks(filters);
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('learning-tracks')
    @ApiOperation({ summary: "Returns last Learning Track" })
    @ApiQuery({ name : "locale", type: "string", enum: ["en", "pt-BR"], required: true })
    @ApiResponse({ status: 200, type: LearningTrackDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: 'Internal Server Error', type: HttpResponseDto })
    @Get('/last')
    async getLastLearningTrack(@Query() filters : LastLearningTracksFilterDto) {
        try {
            return this.learningTracksService.getLastLearningTrack(filters.locale);
        } catch (error) {
            new ErrorHandling(error);
        }
    }
    
}
