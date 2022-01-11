import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { HttpResponseDto } from 'src/config/http-response.dto';
import { TestService } from './test.service';
import { NotificationMessagesService } from '../notification-messages/notification-messages.service';
import { NotificationMessageDTO } from 'src/notification-messages/notification-messages.dto';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService,
    readonly notificationMessagesService: NotificationMessagesService) {}

  @ApiTags('test')
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
  @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
  @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
  @Get('/')
  async getPostDetails() {
    let message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
      token: 'fr1OF5FRQ1m9T-6oN7f2XZ:APA91bF-Lzcc60fvsDUkLN_D4NRW99ERMwsueEx4vmqErH6plr-K14EJn21aNTCSimuBNfs4NYBf-PmUp4OTFFHP_4iWpY8q3eAVHJlmfREPwIU3mMEiAIpDu7bayzYSHbbVeByFC1YW', 
      notification: {
          title: 'Title of your push notification', 
          body: 'Body of your push notification' 
      },
      android: null,
      data: {
        "type": "comments",
        "typeId": "",
        "photoURL": "",
        "amounnt": "",
        "userId": "",
        "userName": "",
      }
    };
    //   post: {
    //     teste: 1,
    //     teste1: 4,
    //     teste2: 3,
    //     teste3: 2
    //   }
    // }
    // data: null

    let oi = await this.notificationMessagesService.sendFirebaseMessage([message]);
    console.log('oq deu aqui mano', oi);
    
    return 'oi'
  }
}
