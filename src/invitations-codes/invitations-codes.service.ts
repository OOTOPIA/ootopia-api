import { Injectable } from '@nestjs/common';
import { InvitationsCodeRepository } from './invitations-codes.repository'
import { CreateInvitationsCodeDto } from './dto/create-invitations-code.dto';
import { UpdateInvitationsCodeDto } from './dto/update-invitations-code.dto';

@Injectable()
export class InvitationsCodesService {
  constructor(private readonly invitationsCodeRepository : InvitationsCodeRepository){}

  create(invitation) {
    return this.invitationsCodeRepository.createOrUpdateInvitation(invitation);
  }

  getInvitationsCodesByUserId(userId: string) {
    return this.invitationsCodeRepository.getInvitationsCodesByUserId(userId);
  }

  // update(id: number, updateInvitationsCodeDto: UpdateInvitationsCodeDto) {
  //   return `This action updates a #${id} invitationsCode`;
  // }

}
