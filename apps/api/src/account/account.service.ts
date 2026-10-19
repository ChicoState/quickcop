import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { UpdatePreferencesDto, UpdateProfileDto } from "./dto";

const toProfile = (r: any) => ({
  username: r.username,
  displayName: r.display_name,
  phone: r.phone,
});
const toPrefs = (r: any) => ({
  priceAlerts: r.price_alerts,
  accountAlerts: r.account_alerts,
});

@Injectable()
export class AccountService {
  constructor(private readonly supabase: SupabaseService) {}

  private get db() {
    return this.supabase.admin;
  }

  async get(userId: string) {
    const [profile, prefs] = await Promise.all([
      this.db.from("profiles").select().eq("id", userId).maybeSingle(),
      this.db.from("notification_preferences").select().eq("user_id", userId).maybeSingle(),
    ]);
    if (profile.error || prefs.error) throw new InternalServerErrorException();
    if (!profile.data || !prefs.data) throw new NotFoundException();

    return {
      profile: toProfile(profile.data),
      notificationPreferences: toPrefs(prefs.data),
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const { data, error } = await this.db
      .from("profiles")
      .update({
        username: dto.username,
        display_name: dto.displayName,
        phone: dto.phone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error?.code === "23505") throw new ConflictException("Username is taken.");
    if (error || !data) throw new InternalServerErrorException();
    return toProfile(data);
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    const { data, error } = await this.db
      .from("notification_preferences")
      .update({
        price_alerts: dto.priceAlerts,
        account_alerts: dto.accountAlerts,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error || !data) throw new InternalServerErrorException();
    return toPrefs(data);
  }
}
