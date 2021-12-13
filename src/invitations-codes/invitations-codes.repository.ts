import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import * as camelcaseKeys from 'camelcase-keys';
import { InvitationsCode } from "./entities/invitations-code.entity";
import { nanoid } from 'nanoid';


@Injectable()
@EntityRepository(InvitationsCode)
export class InvitationsCodeRepository extends Repository<InvitationsCode>{

    constructor() {
        super();
    }

    async createOrUpdateInvitation(data) {
        const invitationCode = this.create();
        Object.assign(invitationCode, data);
        // if (!invitationCode.code) {
        //     invitationCode.code = nanoid(10);
        // }
        return invitationCode;
    }

    async getInvitationsCodesByUserId(userId: string) {
        return await this.find({
          where: {userId, active: true},
          order: {
            type: 'DESC',
          },
        });
    }

    async getInvitationsCodesByCode(code: string) {
        let invitation = camelcaseKeys(await getConnection().query(`
            SELECT * FROM invitations_code
            WHERE code = $1 and active is true
            `, [code]), { deep : true });

        return invitation && invitation.length ? invitation[0] : null;
    }

}