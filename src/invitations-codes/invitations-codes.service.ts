import { Injectable } from '@nestjs/common';
import { InvitationsCodeRepository } from './invitations-codes.repository'
import { CreateInvitationsCodeDto } from './dto/create-invitations-code.dto';
import { UpdateInvitationsCodeDto } from './dto/update-invitations-code.dto';

@Injectable()
export class InvitationsCodesService {
  constructor(private readonly invitationsCodeRepository : InvitationsCodeRepository){}

  async createOrUpdateInvitation(invitation) {
    return await this.invitationsCodeRepository.createOrUpdateInvitation(invitation);
  }

  async getInvitationsCodesByUserId(userId: string) {
    return await this.invitationsCodeRepository.getInvitationsCodesByUserId(userId);
  }

  async getInvitationsCodesByCode(code: string) {
    return await this.invitationsCodeRepository.getInvitationsCodesByCode(code);
  }

}
