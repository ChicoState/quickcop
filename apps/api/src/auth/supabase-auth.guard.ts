import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SupabaseService } from '../supabase/supabase.service';

export type AuthedRequest = Request & { user: { id: string } };

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    const authorization = req.headers.authorization;
    const parts =
      typeof authorization === 'string'
        ? authorization.trim().split(/\s+/)
        : [];
    if (
      parts.length !== 2 ||
      parts[0].toLowerCase() !== 'bearer' ||
      !parts[1]
    ) {
      throw new UnauthorizedException();
    }

    try {
      const { data, error } = await this.supabase.admin.auth.getUser(parts[1]);
      if (error || !data.user) throw new UnauthorizedException();

      req.user = { id: data.user.id };
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
