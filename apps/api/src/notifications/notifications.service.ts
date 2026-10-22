import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateNotificationDto } from './dto';

type NotificationRow = {
  id: string;
  kind: 'price_change' | 'restock';
  name: string;
  retailer: string;
  previous_price: string;
  current_price: string;
  target_price: string;
  enabled: boolean;
  created_at: string;
};

const NOTIFICATION_COLUMNS =
  'id, kind, name, retailer, previous_price, current_price, target_price, enabled, created_at';

const toNotification = (row: NotificationRow) => ({
  id: row.id,
  kind: row.kind,
  name: row.name,
  retailer: row.retailer,
  previousPrice: row.previous_price,
  currentPrice: row.current_price,
  targetPrice: row.target_price,
  enabled: row.enabled,
  createdAt: row.created_at,
});

@Injectable()
export class NotificationsService {
  constructor(private readonly supabase: SupabaseService) {}

  private get db() {
    return this.supabase.admin;
  }

  async list(userId: string) {
    const { data, error } = await this.db
      .from('notifications')
      .select(NOTIFICATION_COLUMNS)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw new InternalServerErrorException();
    return (data as NotificationRow[]).map(toNotification);
  }

  async update(userId: string, id: string, dto: UpdateNotificationDto) {
    const { data, error } = await this.db
      .from('notifications')
      .update({ enabled: dto.enabled })
      .eq('id', id)
      .eq('user_id', userId)
      .select(NOTIFICATION_COLUMNS)
      .maybeSingle();

    if (error) throw new InternalServerErrorException();
    if (!data) throw new NotFoundException();
    return toNotification(data as NotificationRow);
  }
}
