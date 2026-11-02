import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createClient } from '@supabase/supabase-js';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

jest.setTimeout(120_000);

const URL = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321';
const ANON = process.env.SUPABASE_ANON_KEY!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });
const anon = createClient(URL, ANON, { auth: { persistSession: false } });

function userDatabaseClient(token: string) {
  return createClient(URL, ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

async function createUser(label: string) {
  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const email = `${label}${suffix}@example.com`;
  const username = `${label}_${suffix}`.slice(0, 30);

  return createUserWithMetadata(email, username);
}

async function createUserWithMetadata(
  email: string,
  username?: string,
  metadata?: Record<string, string>,
) {
  const userMetadata = {
    ...metadata,
    ...(username === undefined ? {} : { username }),
  };

  const created = await admin.auth.admin.createUser({
    email,
    password: 'password123',
    email_confirm: true,
    user_metadata: userMetadata,
  });
  if (created.error) throw created.error;

  const { data, error } = await anon.auth.signInWithPassword({
    email,
    password: 'password123',
  });
  if (error || !data.session) throw error;

  return {
    id: created.data.user.id,
    username: username ?? '',
    token: data.session.access_token,
  };
}

async function buildApp() {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = configureApp(moduleRef.createNestApplication());
  await app.init();
  return app;
}

describe('account API', () => {
  let app: INestApplication;
  let userA: Awaited<ReturnType<typeof createUser>>;
  let userB: Awaited<ReturnType<typeof createUser>>;

  beforeAll(async () => {
    app = await buildApp();
    userA = await createUser('usera');
    userB = await createUser('userb');
  }, 120_000);

  afterAll(async () => {
    await app?.close();
    if (userA) await admin.auth.admin.deleteUser(userA.id);
    if (userB) await admin.auth.admin.deleteUser(userB.id);
  }, 60_000);

  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

  it('rejects a request with no token', async () => {
    await request(app.getHttpServer()).get('/account').expect(401);
  });

  it('rejects an invalid token', async () => {
    await request(app.getHttpServer())
      .get('/account')
      .set(auth('garbage'))
      .expect(401);
  });

  it('rejects malformed authorization headers', async () => {
    for (const authorization of [
      'Basic garbage',
      'Bearer',
      'Bearer garbage extra',
      'Bearer    ',
    ]) {
      await request(app.getHttpServer())
        .get('/account')
        .set('Authorization', authorization)
        .expect(401);
    }
  });

  it('rejects unauthenticated notification access', async () => {
    await request(app.getHttpServer()).get('/notifications').expect(401);
  });

  it("returns only the caller's own account", async () => {
    await request(app.getHttpServer())
      .patch('/account/profile')
      .set(auth(userA.token))
      .send({ displayName: 'Alice' })
      .expect(200);
    await request(app.getHttpServer())
      .patch('/account/profile')
      .set(auth(userB.token))
      .send({ displayName: 'Bob' })
      .expect(200);

    const a = await request(app.getHttpServer())
      .get('/account')
      .set(auth(userA.token))
      .expect(200);
    const b = await request(app.getHttpServer())
      .get('/account')
      .set(auth(userB.token))
      .expect(200);

    expect(a.body.profile.displayName).toBe('Alice');
    expect(a.body.profile.username).toBe(userA.username);
    expect(b.body.profile.displayName).toBe('Bob');
    expect(b.body.profile.username).toBe(userB.username);
  });

  it('cannot target another user by sending an id', async () => {
    await request(app.getHttpServer())
      .patch('/account/profile')
      .set(auth(userA.token))
      .send({ id: userB.id, displayName: 'Hacked' })
      .expect(400);

    const b = await request(app.getHttpServer())
      .get('/account')
      .set(auth(userB.token))
      .expect(200);
    expect(b.body.profile.displayName).toBe('Bob');
  });

  it('enforces row ownership through database RLS', async () => {
    const clientA = userDatabaseClient(userA.token);

    const profileRead = await clientA
      .from('profiles')
      .select('id')
      .eq('id', userB.id)
      .maybeSingle();
    expect(profileRead.error).toBeNull();
    expect(profileRead.data).toBeNull();

    const profileUpdate = await clientA
      .from('profiles')
      .update({ display_name: 'Should Not Persist' })
      .eq('id', userB.id)
      .select('id')
      .maybeSingle();
    expect(profileUpdate.error).toBeNull();
    expect(profileUpdate.data).toBeNull();

    const preferenceRead = await clientA
      .from('notification_preferences')
      .select('user_id')
      .eq('user_id', userB.id)
      .maybeSingle();
    expect(preferenceRead.error).toBeNull();
    expect(preferenceRead.data).toBeNull();
  });

  it('isolates notification history and updates to the authenticated user', async () => {
    const inserted = await admin
      .from('notifications')
      .insert({
        user_id: userA.id,
        kind: 'price_change',
        name: 'Private test item',
        retailer: 'Test retailer',
        previous_price: '$20.00',
        current_price: '$15.00',
        target_price: '$15.00',
        enabled: true,
      })
      .select('id')
      .single();
    if (inserted.error || !inserted.data) throw inserted.error;

    const own = await request(app.getHttpServer())
      .get('/notifications')
      .set(auth(userA.token))
      .expect(200);
    expect(own.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: inserted.data.id,
          name: 'Private test item',
        }),
      ]),
    );

    const otherUser = await request(app.getHttpServer())
      .get('/notifications')
      .set(auth(userB.token))
      .expect(200);
    expect(otherUser.body).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: inserted.data.id }),
      ]),
    );

    await request(app.getHttpServer())
      .patch(`/notifications/${inserted.data.id}`)
      .set(auth(userB.token))
      .send({ enabled: false })
      .expect(404);

    await request(app.getHttpServer())
      .patch(`/notifications/${inserted.data.id}`)
      .set(auth(userA.token))
      .send({ enabled: false })
      .expect(200);
  });

  it('returns 409 for a duplicate username, ignoring case', async () => {
    await request(app.getHttpServer())
      .patch('/account/profile')
      .set(auth(userA.token))
      .send({ username: userB.username.toUpperCase() })
      .expect(409);
  });

  it('normalizes profile PATCH values and preserves omitted fields', async () => {
    const before = await request(app.getHttpServer())
      .get('/account')
      .set(auth(userA.token))
      .expect(200);

    const updated = await request(app.getHttpServer())
      .patch('/account/profile')
      .set(auth(userA.token))
      .send({ username: '  Normalized_User  ' })
      .expect(200);

    expect(updated.body.username).toBe('normalized_user');

    const after = await request(app.getHttpServer())
      .get('/account')
      .set(auth(userA.token))
      .expect(200);
    expect(after.body.profile.displayName).toBe(
      before.body.profile.displayName,
    );
    expect(after.body.profile.phone).toBe(before.body.profile.phone);
  });

  it('preserves omitted notification preference fields', async () => {
    await request(app.getHttpServer())
      .patch('/account/notification-preferences')
      .set(auth(userB.token))
      .send({ restock: { push: true } })
      .expect(200);

    const updated = await request(app.getHttpServer())
      .patch('/account/notification-preferences')
      .set(auth(userB.token))
      .send({ restock: { email: true } })
      .expect(200);

    expect(updated.body.restock.push).toBe(true);
    expect(updated.body.restock.email).toBe(true);
  });

  it('normalizes username and optional profile metadata during signup', async () => {
    const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const created = await createUserWithMetadata(
      `normalized${suffix}@example.com`,
      `  Mixed_Name_${suffix}  `,
      { display_name: '  Example User  ', phone: '  +14155550123  ' },
    );

    try {
      const account = await request(app.getHttpServer())
        .get('/account')
        .set(auth(created.token))
        .expect(200);

      expect(account.body.profile.username).toBe(`mixed_name_${suffix}`);
      expect(account.body.profile.displayName).toBe('Example User');
      expect(account.body.profile.phone).toBe('+14155550123');
    } finally {
      await admin.auth.admin.deleteUser(created.id);
    }
  });

  it('rejects signup without a valid username', async () => {
    const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const created = await admin.auth.admin.createUser({
      email: `missing${suffix}@example.com`,
      password: 'password123',
      email_confirm: true,
    });

    expect(created.data.user).toBeNull();
    expect(created.error).toBeTruthy();
  });

  it('rejects invalid phone metadata during signup', async () => {
    const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const created = await admin.auth.admin.createUser({
      email: `phone${suffix}@example.com`,
      password: 'password123',
      email_confirm: true,
      user_metadata: { username: `phone_${suffix}`, phone: 'not-a-phone' },
    });

    expect(created.data.user).toBeNull();
    expect(created.error).toBeTruthy();
  });

  it('returns 400 for invalid notification fields', async () => {
    // wrong type on a real field
    await request(app.getHttpServer())
      .patch('/account/notification-preferences')
      .set(auth(userA.token))
      .send({ priceChange: { push: 'yes' } })
      .expect(400);
    // unknown top-level field
    await request(app.getHttpServer())
      .patch('/account/notification-preferences')
      .set(auth(userA.token))
      .send({ foo: true })
      .expect(400);
    // unknown nested field
    await request(app.getHttpServer())
      .patch('/account/notification-preferences')
      .set(auth(userA.token))
      .send({ restock: { sms: true } })
      .expect(400);
  });

  it('persists updates after the app restarts', async () => {
    await request(app.getHttpServer())
      .patch('/account/notification-preferences')
      .set(auth(userA.token))
      .send({ restock: { push: true } })
      .expect(200);

    await app.close();
    app = await buildApp();

    const res = await request(app.getHttpServer())
      .get('/account')
      .set(auth(userA.token))
      .expect(200);
    expect(res.body.notificationPreferences.restock.push).toBe(true);
    // untouched channels keep their defaults (all off)
    expect(res.body.notificationPreferences.restock.email).toBe(false);
    expect(res.body.notificationPreferences.priceChange.push).toBe(false);
    expect(res.body.notificationPreferences.priceChange.email).toBe(false);
  });
});
