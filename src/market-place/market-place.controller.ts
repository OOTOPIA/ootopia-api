import { Controller, Get, Post, Body, Put, Param, Delete, UseInterceptors, Query } from '@nestjs/common';
import { MarketPlaceService } from './market-place.service';
import { MarketPlaceDto, MarketPlaceFilterDto } from './dto/create-market-place.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorHandling } from 'src/config/error-handling';
import { HttpResponseDto } from 'src/config/http-response.dto';
import { SentryInterceptor } from 'src/interceptors/sentry.interceptor';

@Controller('market-place')
export class MarketPlaceController {
  constructor(private readonly marketPlaceService: MarketPlaceService) {}


  @UseInterceptors(SentryInterceptor)
  @ApiTags('market-place')
  @ApiOperation({ summary: "Returns a list of Market Place" })
  @ApiQuery({ name : "limit", type: "number", description: "Limit of entries (50 max.)", required: false })
  @ApiQuery({ name : "offset", type: "number", required: false })
  @ApiResponse({ status: 200, type: MarketPlaceDto, isArray: true })
  @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
  @ApiResponse({ status: 500, description: 'Internal Server Error', type: HttpResponseDto })
  @Get()
  async getHistory(@Query() filters : MarketPlaceFilterDto) {
    try {

      if (filters.offset > 10) {
          return [];
      }

      let marketPlace = [];

      for(let i = 0; i < filters.limit; i++) {
        marketPlace.push({    
          id : i,
          title: `Title number ${i+1}`,
          description: " Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
          photoUrl: "https://ootopia-files-staging.s3.sa-east-1.amazonaws.com/ootopia_cover.png",
          price:  1599.4521,
          userName:  "john wick",
          userEmail:  "teste@teste.com.br",
          userPhotoUrl:  "https://ootopia-files-staging.s3.sa-east-1.amazonaws.com/users/00851c9d-fb60-40b5-8ab2-91bb59bd8163/photo-1632935531893.jpg",
          userPhoneNumber:  "44 4444-4444",
          userLocation:  "BR",
        });
      }

      return marketPlace;

    } catch (error) {
      new ErrorHandling(error);
    }
  }

  @UseInterceptors(SentryInterceptor)
  @ApiTags('market-place')
  @ApiOperation({ summary: "Return Market Place by id" })
  @ApiResponse({ status: 200, type: MarketPlaceDto })
  @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
  @ApiResponse({ status: 500, description: 'Internal Server Error', type: HttpResponseDto })
  @Get('/:id')
  async getMarketPlaceById(@Param('id') id: string) {
    try {

      return {    
        id : id,
        title: `Title number ${+id+1}`,
        description: " Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        photoUrl: "https://ootopia-files-staging.s3.sa-east-1.amazonaws.com/ootopia_cover.png",
        price:  1599.4521,
        userName:  "john wick",
        userEmail:  "teste@teste.com.br",
        userPhotoUrl:  "https://ootopia-files-staging.s3.sa-east-1.amazonaws.com/users/00851c9d-fb60-40b5-8ab2-91bb59bd8163/photo-1632935531893.jpg",
        userPhoneNumber:  "44 4444-4444",
        userLocation:  "BR",
      }
    }
    catch (error) {
      new ErrorHandling(error);
    }
  }

  // @Get()
  // findAll() {
  //   return this.marketPlaceService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.marketPlaceService.findOne(+id);
  // }

  // @Put(':id')
  // update(@Param('id') id: string, @Body() updateMarketPlaceDto: UpdateMarketPlaceDto) {
  //   return this.marketPlaceService.update(+id, updateMarketPlaceDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.marketPlaceService.remove(+id);
  // }
}
