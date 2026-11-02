import { IsBoolean } from 'class-validator';

export class UpdateNotificationDto {
  @IsBoolean()
  enabled!: boolean;
}
