import { Controller, Get, Post, Body, Put, Param, Delete, UseInterceptors, Query, UseGuards, Req, HttpCode, Res, Header, Request } from '@nestjs/common';
import { MarketPlaceService } from './market-place.service';
import { MarketPlaceByIdDto, MarketPlaceDto, MarketPlaceFilterDto } from './dto/create-market-place.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorHandling } from 'src/config/error-handling';
import { HttpResponseDto } from 'src/config/http-response.dto';
import { SentryInterceptor } from 'src/interceptors/sentry.interceptor';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MarketPlacePurchaseCreateDto } from './dto/market-place-purchase-create.dto';
import { JwtOptionalAuthGuard } from 'src/auth/jwt-optional-auth.guard';

@Controller('market-place')
export class MarketPlaceProductsController {
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
  @HttpCode(200)
  async getMarketPlaces(@Query() filters : MarketPlaceFilterDto) {
    try {

      return this.marketPlaceService.getMarketPlaceProducts(filters);
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
  @HttpCode(200)
  async getMarketPlaceProductById(@Param('id') id : string) {
    try {
      return this.marketPlaceService.getMarketPlaceProductById(id);
    }
    catch (error) {
      new ErrorHandling(error);
    }
  }

  @UseInterceptors(SentryInterceptor)
  @ApiTags('market-place')
  @ApiOperation({ summary: "redirect to Market place or Store" })
  @ApiParam({name : "id" })
  @ApiResponse({ status: 200, type: MarketPlaceDto })
  @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
  @ApiResponse({ status: 500, description: 'Internal Server Error', type: HttpResponseDto })
  @Header('content-type', 'text/html')
  @Get('/shared/:id')
  async getMarketPlaceShared(@Param('id') id : string) {
    try {
      return this.marketPlaceService.getMarketPlaceSharedLink(id);
    }
    catch (error) {
      new ErrorHandling(error);
    }
  }

  @UseInterceptors(SentryInterceptor)
  @ApiTags('market-place')
  @ApiOperation({ summary: "Make purchase" })
  @ApiBearerAuth('Bearer')
  @ApiBody({ type: MarketPlacePurchaseCreateDto })
  @ApiParam({ name : "id", type: "string", description: "Market Place Product ID" })
  @ApiResponse({ status: 201, description: 'Successfully created' })
  @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
  @ApiResponse({ status: 500, description: 'Internal Server Error', type: HttpResponseDto })
  @UseGuards(JwtAuthGuard)
  @Post('/:id/purchase')
  @HttpCode(201)
  async purchase(@Req() { user }, @Param('id') id : string,  @Body() { message } : MarketPlacePurchaseCreateDto) {
    try {
      return await this.marketPlaceService.purchase(id, user.id, message);
    }
    catch (error) {
      new ErrorHandling(error);
    }
  }
  @UseInterceptors(SentryInterceptor)
    @ApiTags('market-place')
    @ApiBearerAuth('Bearer')
    @ApiOperation({ summary: 'Admin delete market-place' })
    @ApiParam({ name: "id", type: "string", description: "marketPlaceId to delete", required: true})
    @ApiResponse({ status: 200 })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @UseGuards(JwtAuthGuard)
    @Delete('/:id')
    async deleteUser(@Param('id') id: string, @Req() { user }) {
        try {
            await this.marketPlaceService.adminDeleteMarketPlace(user.id, id);
        } catch (error) {
            new ErrorHandling(error);
        }
    }

}
