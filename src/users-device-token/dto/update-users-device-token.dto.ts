import { PartialType } from '@nestjs/mapped-types';
import { CreateUsersDeviceTokenDto } from './create-users-device-token.dto';

export class UpdateUsersDeviceTokenDto extends PartialType(CreateUsersDeviceTokenDto) {}
