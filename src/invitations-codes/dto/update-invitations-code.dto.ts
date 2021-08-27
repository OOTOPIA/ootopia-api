import { PartialType } from '@nestjs/mapped-types';
import { CreateInvitationsCodeDto } from './create-invitations-code.dto';

export class UpdateInvitationsCodeDto extends PartialType(CreateInvitationsCodeDto) {}
