import { IsBoolean, IsOptional, IsString, Matches, MaxLength } from "class-validator";

export class UpdateProfileDto {
  @IsOptional()
  @Matches(/^[a-zA-Z0-9_]{3,30}$/, {
    message: "username must be 3-30 letters, numbers or underscores",
  })
  username?: string;

  @IsOptional() @IsString() @MaxLength(50)
  displayName?: string;

  @IsOptional()
  @Matches(/^\+?[0-9]{7,15}$/, { message: "invalid phone number" })
  phone?: string;
}

export class UpdatePreferencesDto {
  @IsOptional() @IsBoolean() priceAlerts?: boolean;
  @IsOptional() @IsBoolean() accountAlerts?: boolean;
}
