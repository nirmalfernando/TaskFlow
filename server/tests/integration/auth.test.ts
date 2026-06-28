import request from 'supertest';
import { createApp } from '../../src/app';
import { cleanDatabase, registerAndLogin } from '../setup';

const app = createApp();
const BASE = '/api/v1/auth';

const seedUser = {
  email: 'auth-seed@example.com',
  password: 'Password123',
  firstName: 'Auth',
  lastName: 'Seed',
};

beforeAll(async () => {
  await cleanDatabase();
});

describe('POST /register', () => {
  it('creates account and returns user + tokens', async () => {
    const res = await request(app).post(`${BASE}/register`).send(seedUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(seedUser.email);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.tokens.refreshToken).toBeDefined();
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.user.refreshToken).toBeUndefined();
  });

  it('409 on duplicate email', async () => {
    const res = await request(app).post(`${BASE}/register`).send(seedUser);
    expect(res.status).toBe(409);
  });

  it('422 on invalid email', async () => {
    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ ...seedUser, email: 'notanemail' });
    expect(res.status).toBe(422);
    expect(res.body.errors).toBeDefined();
  });

  it('422 on password missing uppercase', async () => {
    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ ...seedUser, email: 'unique1@test.com', password: 'password1' });
    expect(res.status).toBe(422);
  });

  it('422 on password too short', async () => {
    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ ...seedUser, email: 'unique2@test.com', password: 'P1x' });
    expect(res.status).toBe(422);
  });
});

describe('POST /login', () => {
  it('200 returns tokens on valid credentials', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: seedUser.email, password: seedUser.password });

    expect(res.status).toBe(200);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe(seedUser.email);
  });

  it('401 on wrong password', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: seedUser.email, password: 'WrongPass1' });
    expect(res.status).toBe(401);
  });

  it('401 on unknown email', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: 'ghost@test.com', password: 'Password123' });
    expect(res.status).toBe(401);
  });

  it('422 on missing fields', async () => {
    const res = await request(app).post(`${BASE}/login`).send({});
    expect(res.status).toBe(422);
  });
});

describe('POST /refresh', () => {
  let refreshToken: string;

  beforeAll(async () => {
    const user = await registerAndLogin(app, { email: 'refresh@test.com' });
    refreshToken = user.tokens.refreshToken;
  });

  it('200 returns new tokens', async () => {
    const res = await request(app).post(`${BASE}/refresh`).send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it('401 on invalid token string', async () => {
    const res = await request(app)
      .post(`${BASE}/refresh`)
      .send({ refreshToken: 'not.a.valid.jwt' });
    expect(res.status).toBe(401);
  });

  it('422 on missing body', async () => {
    const res = await request(app).post(`${BASE}/refresh`).send({});
    expect(res.status).toBe(422);
  });
});

describe('POST /logout', () => {
  let accessToken: string;

  beforeAll(async () => {
    const user = await registerAndLogin(app, { email: 'logout@test.com' });
    accessToken = user.tokens.accessToken;
  });

  it('401 without token', async () => {
    const res = await request(app).post(`${BASE}/logout`);
    expect(res.status).toBe(401);
  });

  it('204 when authenticated', async () => {
    const res = await request(app)
      .post(`${BASE}/logout`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(204);
  });
});

describe('GET /me', () => {
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    const user = await registerAndLogin(app, { email: 'me@test.com' });
    accessToken = user.tokens.accessToken;
    userId = user.id;
  });

  it('200 returns current user without sensitive fields', async () => {
    const res = await request(app)
      .get(`${BASE}/me`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(userId);
    expect(res.body.data.email).toBe('me@test.com');
    expect(res.body.data.password).toBeUndefined();
    expect(res.body.data.refreshToken).toBeUndefined();
  });

  it('401 without token', async () => {
    const res = await request(app).get(`${BASE}/me`);
    expect(res.status).toBe(401);
  });

  it('401 with malformed bearer token', async () => {
    const res = await request(app)
      .get(`${BASE}/me`)
      .set('Authorization', 'Bearer garbage.token.here');
    expect(res.status).toBe(401);
  });
});
