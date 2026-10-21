import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdatePreferencesDto, UpdateProfileDto } from './dto';

type ProfileRow = {
  username: string;
  display_name: string | null;
  phone: string | null;
};

type PreferencesRow = {
  restock_push: boolean;
  restock_email: boolean;
  price_change_push: boolean;
  price_change_email: boolean;
};

const PROFILE_COLUMNS = 'username, display_name, phone';
const PREFERENCE_COLUMNS =
  'restock_push, restock_email, price_change_push, price_change_email';

const toProfile = (row: ProfileRow) => ({
  username: row.username,
  displayName: row.display_name,
  phone: row.phone,
});

const toPrefs = (row: PreferencesRow) => ({
  restock: { push: row.restock_push, email: row.restock_email },
  priceChange: { push: row.price_change_push, email: row.price_change_email },
});

const normalizeOptionalText = (value: string | null | undefined) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return value.trim() || null;
};

@Injectable()
export class AccountService {
  constructor(private readonly supabase: SupabaseService) {}

  private get db() {
    return this.supabase.admin;
  }

  async get(userId: string) {
    const [profile, prefs] = await Promise.all([
      this.db
        .from('profiles')
        .select(PROFILE_COLUMNS)
        .eq('id', userId)
        .maybeSingle(),
      this.db
        .from('notification_preferences')
        .select(PREFERENCE_COLUMNS)
        .eq('user_id', userId)
        .maybeSingle(),
    ]);
    if (profile.error || prefs.error) throw new InternalServerErrorException();
    if (!profile.data || !prefs.data) throw new NotFoundException();

    return {
      profile: toProfile(profile.data as ProfileRow),
      notificationPreferences: toPrefs(prefs.data as PreferencesRow),
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updates: Record<string, unknown> = {};

    if (dto.username !== undefined) {
      updates.username = dto.username.trim().toLowerCase();
    }
    if (dto.displayName !== undefined) {
      updates.display_name = normalizeOptionalText(dto.displayName);
    }
    if (dto.phone !== undefined) {
      updates.phone = normalizeOptionalText(dto.phone);
    }

    if (Object.keys(updates).length === 0) {
      const { data, error } = await this.db
        .from('profiles')
        .select(PROFILE_COLUMNS)
        .eq('id', userId)
        .maybeSingle();
      if (error) throw new InternalServerErrorException();
      if (!data) throw new NotFoundException();
      return toProfile(data as ProfileRow);
    }

    const { data, error } = await this.db
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select(PROFILE_COLUMNS)
      .maybeSingle();

    if (error?.code === '23505')
      throw new ConflictException('Username is taken.');
    if (error) throw new InternalServerErrorException();
    if (!data) throw new NotFoundException();
    return toProfile(data as ProfileRow);
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    const updates: Record<string, unknown> = {};

    if (dto.restock?.push !== undefined)
      updates.restock_push = dto.restock.push;
    if (dto.restock?.email !== undefined)
      updates.restock_email = dto.restock.email;
    if (dto.priceChange?.push !== undefined) {
      updates.price_change_push = dto.priceChange.push;
    }
    if (dto.priceChange?.email !== undefined) {
      updates.price_change_email = dto.priceChange.email;
    }

    if (Object.keys(updates).length === 0) {
      const { data, error } = await this.db
        .from('notification_preferences')
        .select(PREFERENCE_COLUMNS)
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw new InternalServerErrorException();
      if (!data) throw new NotFoundException();
      return toPrefs(data as PreferencesRow);
    }

    const { data, error } = await this.db
      .from('notification_preferences')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select(PREFERENCE_COLUMNS)
      .maybeSingle();

    if (error) throw new InternalServerErrorException();
    if (!data) throw new NotFoundException();
    return toPrefs(data as PreferencesRow);
  }
}
