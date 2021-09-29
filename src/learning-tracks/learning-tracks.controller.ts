import { Controller, Get, Post, Body, HttpException, Param, Query, Req, UseInterceptors, UseGuards, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiExcludeEndpoint, ApiParam, ApiTags } from '@nestjs/swagger';
import { SentryInterceptor } from '../interceptors/sentry.interceptor';
import { ErrorHandling } from './../config/error-handling';
import { HttpResponseDto } from './../config/http-response.dto';
import { LearningTrackDto, LearningTracksFilterDto } from './learning-tracks.dto';

@Controller('learning-tracks')
export class LearningTracksController {

    @UseInterceptors(SentryInterceptor)
    @ApiTags('learning-tracks')
    @ApiOperation({ summary: "Returns a list of Learning Tracks" })
    @ApiQuery({ name : "limit", type: "number", description: "Limit of entries (50 max.)", required: false })
    @ApiQuery({ name : "offset", type: "number", required: false })
    @ApiResponse({ status: 200, type: LearningTrackDto, isArray: true })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: 'Internal Server Error', type: HttpResponseDto })
    @Get()
    async getHistory(@Query() filters : LearningTracksFilterDto) {
        try {

            if (filters.offset > 10) {
                return [];
            }

            let learningTracks = [];

            for(let i = 0; i < filters.limit; i++) {
                learningTracks.push({    
                    id : i,
                    userPhotoUrl : "https://ootopia-files-staging.s3.sa-east-1.amazonaws.com/woman_pic.PNG",
                    userName : "OOTOPIA Team",
                    title : "How to make Kombucha",
                    description : "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                    imageUrl : "https://ootopia-files-staging.s3.sa-east-1.amazonaws.com/ootopia_cover.png",
                    ooz : 2.45,
                    totalTimeInMinutes : 15,
                    location : "Belo Horizonte - Brazil",
                    chapters : [
                        {
                            id : 1,
                            title : "1. Welcome to OOTOPIA + Regen Movement",
                            videoUrl: "https://videodelivery.net/898bec849b71ce01934ce6c3a21fa2ac/manifest/video.m3u8",
                            videoThumbUrl : "https://ootopia-files-staging.s3.sa-east-1.amazonaws.com/ootopia_learning_track_icon.png",
                            ooz : 0.5,
                            timeInMinutes : 10,
                            createdAt : new Date(),
                            updatedAt : new Date(),
                        },
                        {
                            id : 2,
                            title : "2. OOTOPIA what/why/how",
                            videoUrl: "https://videodelivery.net/898bec849b71ce01934ce6c3a21fa2ac/manifest/video.m3u8",
                            videoThumbUrl : "https://ootopia-files-staging.s3.sa-east-1.amazonaws.com/ootopia_learning_track_icon.png",
                            ooz : 0.5,
                            timeInMinutes : 10,
                            createdAt : new Date(),
                            updatedAt : new Date(),
                        },
                        {
                            id : 3,
                            title : "3. OOTOPIA what/why/how",
                            videoUrl: "https://videodelivery.net/898bec849b71ce01934ce6c3a21fa2ac/manifest/video.m3u8",
                            videoThumbUrl : "https://ootopia-files-staging.s3.sa-east-1.amazonaws.com/ootopia_learning_track_icon.png",
                            ooz : 0.5,
                            timeInMinutes : 10,
                            createdAt : new Date(),
                            updatedAt : new Date(),
                        }
                    ],
                    createdAt : new Date(),
                    updatedAt : new Date(),
                });
            }

            console.log("testando", learningTracks.length);

            return learningTracks;

        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('learning-tracks')
    @ApiOperation({ summary: "Returns last Learning Track" })
    @ApiResponse({ status: 200, type: LearningTrackDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: 'Internal Server Error', type: HttpResponseDto })
    @Get('/last')
    async getLastLearningTrack() {
        try {

            return {    
                    id : 1,
                    userPhotoUrl : "https://ootopia-files-staging.s3.sa-east-1.amazonaws.com/woman_pic.PNG",
                    userName : "OOTOPIA Team",
                    title : "How to make Kombucha",
                    description : "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                    imageUrl : "https://ootopia-files-staging.s3.sa-east-1.amazonaws.com/ootopia_cover.png",
                    ooz : 2.45,
                    totalTimeInMinutes : 15,
                    location : "Belo Horizonte - Brazil",
                    chapters : [
                        {
                            id : 1,
                            title : "1. Welcome to OOTOPIA + Regen Movement",
                            videoUrl: "https://videodelivery.net/898bec849b71ce01934ce6c3a21fa2ac/manifest/video.m3u8",
                            videoThumbUrl : "https://ootopia-files-staging.s3.sa-east-1.amazonaws.com/ootopia_learning_track_icon.png",
                            ooz : 0.5,
                            timeInMinutes : 10,
                            createdAt : new Date(),
                            updatedAt : new Date(),
                        },
                        {
                            id : 2,
                            title : "2. OOTOPIA what/why/how",
                            videoUrl: "https://videodelivery.net/898bec849b71ce01934ce6c3a21fa2ac/manifest/video.m3u8",
                            videoThumbUrl : "https://ootopia-files-staging.s3.sa-east-1.amazonaws.com/ootopia_learning_track_icon.png",
                            ooz : 0.5,
                            timeInMinutes : 10,
                            createdAt : new Date(),
                            updatedAt : new Date(),
                        },
                        {
                            id : 3,
                            title : "3. OOTOPIA what/why/how",
                            videoUrl: "https://videodelivery.net/898bec849b71ce01934ce6c3a21fa2ac/manifest/video.m3u8",
                            videoThumbUrl : "https://ootopia-files-staging.s3.sa-east-1.amazonaws.com/ootopia_learning_track_icon.png",
                            ooz : 0.5,
                            timeInMinutes : 10,
                            createdAt : new Date(),
                            updatedAt : new Date(),
                        }
                    ],
                    createdAt : new Date(),
                    updatedAt : new Date(),
                };

        } catch (error) {
            new ErrorHandling(error);
        }
    }
    
}
