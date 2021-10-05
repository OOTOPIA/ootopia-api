import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { InvitationsCodesService } from './invitations-codes.service';
import { CreateInvitationsCodeDto } from './dto/create-invitations-code.dto';
import { UpdateInvitationsCodeDto } from './dto/update-invitations-code.dto';

@Controller('invitations-codes')
export class InvitationsCodesController {
  constructor(private readonly invitationsCodesService: InvitationsCodesService) {}

  // @Post()
  // create(@Body() createInvitationsCodeDto: CreateInvitationsCodeDto) {
  //   return this.invitationsCodesService.create(createInvitationsCodeDto);
  // }

  // @Get(':userId')
  // findOne(@Param('userId') id: string) {
  //   return this.invitationsCodesService.getInvitationsCodesByUserId(id);
  // }

  // @Put(':id')
  // update(@Param('id') id: string, @Body() updateInvitationsCodeDto: UpdateInvitationsCodeDto) {
  //   return this.invitationsCodesService.update(+id, updateInvitationsCodeDto);
  // }

}
