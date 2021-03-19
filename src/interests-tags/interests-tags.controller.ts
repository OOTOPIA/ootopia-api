import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiExcludeEndpoint, ApiParam, ApiTags } from '@nestjs/swagger';
import { ErrorHandling } from './../config/error-handling';
import { HttpResponseDto } from './../config/http-response.dto';
import { FilterInterestsTagsDto, InterestsTagsDto } from './interests-tags.dto';
import { InterestsTagsService } from './interests-tags.service';

@Controller('interests-tags')
export class InterestsTagsController {

    constructor(
        private readonly interestsTagsService : InterestsTagsService) {}

    @ApiTags('interests-tags')
    @ApiQuery({ name: "language", type: "string", example: "pt-BR" } )
    @ApiOperation({ summary: 'Returns a list of tags' })
    @ApiResponse({ status: 200, type: InterestsTagsDto, isArray: true })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @Get()
    async getTags(@Query() filters : FilterInterestsTagsDto) {
        try {

            return await this.interestsTagsService.getTags(filters.language);
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }

}
