import { Controller, Get, Header, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorHandling } from 'src/config/error-handling';
import { HttpResponseDto } from 'src/config/http-response.dto';
import { SentryInterceptor } from 'src/interceptors/sentry.interceptor';
import { AppleAppSiteAssociationService } from './apple-app-site-association.service';

@Controller('apple-app-site-association')
export class AppleAppSiteAssociationController {
  constructor(private readonly appleAppSiteAssociationService: AppleAppSiteAssociationService) {
  }

  @UseInterceptors(SentryInterceptor)
  @ApiTags('apple-app-site-association')
  @ApiOperation({ summary: "return apple-app-site-association" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
  @ApiResponse({ status: 500, description: 'Internal Server Error', type: HttpResponseDto })
  @Header( 'Content-Type', 'application/json' )
  @Get('')
  async getAppleAppSiteAssociationJSON() {
    try {
      return `
      {
        "applinks": {
          "apps": [],
          "details": [
            {
              "appID": "org.ootopia.beta2",
              "paths": ["*"]
            }
          ]
        }
      }`;
    }
    catch (error) {
      new ErrorHandling(error);
    }
  }
}
