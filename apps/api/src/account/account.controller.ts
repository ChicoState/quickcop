import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import type { AuthedRequest } from '../auth/supabase-auth.guard';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { AccountService } from './account.service';
import { UpdatePreferencesDto, UpdateProfileDto } from './dto';
@Controller('account')
@UseGuards(SupabaseAuthGuard)
export class AccountController {
  constructor(private readonly account: AccountService) {}

  @Get()
  get(@Req() req: AuthedRequest) {
    return this.account.get(req.user.id);
  }

  @Patch('profile')
  updateProfile(@Req() req: AuthedRequest, @Body() dto: UpdateProfileDto) {
    return this.account.updateProfile(req.user.id, dto);
  }

  @Patch('notification-preferences')
  updatePreferences(
    @Req() req: AuthedRequest,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.account.updatePreferences(req.user.id, dto);
  }
}
