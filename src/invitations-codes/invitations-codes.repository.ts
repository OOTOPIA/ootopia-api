import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import * as camelcaseKeys from 'camelcase-keys';
import { InvitationsCode } from "./entities/invitations-code.entity";

@Injectable()
@EntityRepository(InvitationsCode)
export class InvitationsCodeRepository extends Repository<InvitationsCode>{

    constructor() {
        super();
    }

    async createOrUpdateInvitation(data) {
        const invitationCode = this.create();
        Object.assign(invitationCode, data);
        return await this.save(invitationCode);
    }

    async getInvitationsCodesByUserId(userId: string) {
        return await this.find({
          where: {userId, active: true},
        });
    }

}