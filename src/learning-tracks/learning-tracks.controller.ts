import { Controller, Get, Post, Body, HttpException, Param, Query, Req, UseInterceptors, UseGuards, HttpCode, Header, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiExcludeEndpoint, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SentryInterceptor } from '../interceptors/sentry.interceptor';
import { ErrorHandling } from './../config/error-handling';
import { HttpResponseDto } from './../config/http-response.dto';
import { LastLearningTracksFilterDto, LearningTrackDto, LearningTracksFilterDto } from './learning-tracks.dto';
import { LearningTracksService } from './learning-tracks.service';
import { JwtOptionalAuthGuard } from 'src/auth/jwt-optional-auth.guard';

@Controller('learning-tracks')
export class LearningTracksController {

    constructor(private readonly learningTracksService: LearningTracksService) {}

    @UseInterceptors(SentryInterceptor)
    @ApiTags('learning-tracks')
    @ApiBearerAuth('Bearer')
    @ApiOperation({ summary: "Returns a list of Learning Tracks" })
    @ApiQuery({ name : "locale", type: "string", enum: ["en", "pt-BR"], required: false })
    @ApiQuery({ name : "limit", type: "number", description: "Limit of entries (50 max.)", required: false })
    @ApiQuery({ name : "offset", type: "number", required: false })
    @ApiResponse({ status: 200, type: LearningTrackDto, isArray: true })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: 'Internal Server Error', type: HttpResponseDto })
    @UseGuards(JwtOptionalAuthGuard)
    @Get()
    async getLearningTracks(@Req() req, @Query() filters : LearningTracksFilterDto) {
        try {
            filters.showAtTimeline = true;
            return await this.learningTracksService.getLearningTracks(filters, req.user ? req.user.id : null);
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('learning-tracks')
    @ApiOperation({ summary: "redirect to Learning Tracks or Store" })
    @ApiParam({name : "id" })
    @ApiResponse({ status: 200, type: LearningTrackDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: 'Internal Server Error', type: HttpResponseDto })
    @Header('content-type', 'text/html')
    @Get('/shared/:id')
    async getLearningTracksShared(@Param('id') id : string) {
        try {
            return this.learningTracksService.getLearningTrackSharedLink(id);
      
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('learning-tracks')
    @ApiBearerAuth('Bearer')
    @ApiOperation({ summary: "Returns last Learning Track" })
    @ApiQuery({ name : "locale", type: "string", enum: ["en", "pt-BR"], required: true })
    @ApiResponse({ status: 200, type: LearningTrackDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: 'Internal Server Error', type: HttpResponseDto })
    @UseGuards(JwtOptionalAuthGuard)
    @Get('/last')
    async getLastLearningTrack(@Req() req, @Query() filters : LastLearningTracksFilterDto) {
        try {
            return this.learningTracksService.getLastLearningTrack(filters.locale, req.user ? req.user.id : null);
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('learning-tracks')
    @ApiBearerAuth('Bearer')
    @ApiOperation({ summary: "Returns a Welcome Guide Learning Track" })
    @ApiResponse({ status: 200, type: LearningTrackDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: 'Internal Server Error', type: HttpResponseDto })
    @UseGuards(JwtOptionalAuthGuard)
    @Get('/welcome-guide/:locale')
    async getWelcomeGuide(@Req() req,  @Param('locale') locale : string) {
        try {
            if (locale != "pt-BR") {
                locale = "en";
            }
            return await this.learningTracksService.getWelcomeGuideLearningTrack(locale, req.user ? req.user.id : null);
        } catch (error) {
            new ErrorHandling(error);
            return error
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('learning-tracks')
    @ApiOperation({ summary: "Returns a Learning Tracks" })
    @ApiResponse({ status: 200, type: LearningTrackDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: 'Internal Server Error', type: HttpResponseDto })
    @Get('/:learningTrackId')
    async getLearningTracksById(@Param('learningTrackId') learningTrackId : string) {
        try {
            return this.learningTracksService.getLearningTracksById(learningTrackId);
        } catch (error) {
            new ErrorHandling(error);
            return error
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('learning-tracks')
    @ApiBearerAuth('Bearer')
    @ApiOperation({ summary: "Mark Learning Track chapter completed" })
    @ApiResponse({ status: 200, description: 'Successfully marked complete' })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: 'Internal Server Error', type: HttpResponseDto })
    @UseGuards(JwtAuthGuard)
    @Post('/:learningTrackId/chapter/:chapterId')
    @HttpCode(200)
    async markChapterCompleted(
        @Req() { user },
        @Param('learningTrackId') learningTrackId : string, 
        @Param('chapterId') chapterId : string) {
        try {
            return this.learningTracksService.markLearningTrackChapterCompleted(learningTrackId, chapterId, user.id);
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('learning-tracks')
    @ApiBearerAuth('Bearer')
    @ApiOperation({ summary: 'Admin delete learning-tracks' })
    @ApiParam({ name: "id", type: "string", description: "learningTrackId to delete", required: true})
    @ApiResponse({ status: 200 })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @UseGuards(JwtAuthGuard)
    @Delete('/:id')
    async deleteUser(@Param('id') id: string, @Req() { user }) {
        try {
            await this.learningTracksService.adminDeleteLearningTrack(user.id, id);
        } catch (error) {
            new ErrorHandling(error);
        }
    }
    
}
