import request from 'supertest';
import { createApp } from '../../src/app';
import { cleanDatabase, prisma, registerAndLogin, type TestUser } from '../setup';

const app = createApp();
const BASE = '/api/v1/tasks';

let user: TestUser;
let admin: TestUser;

beforeAll(async () => {
  await cleanDatabase();

  user = await registerAndLogin(app, { email: 'task-user@test.com' });
  admin = await registerAndLogin(app, { email: 'task-admin@test.com' });

  // Promote admin user via Prisma directly (no API for role change without an existing admin)
  await prisma.user.update({ where: { id: admin.id }, data: { role: 'ADMIN' } });

  // Re-login admin to get a token with ADMIN role
  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'task-admin@test.com', password: 'Password123' });
  admin.tokens = loginRes.body.data.tokens as TestUser['tokens'];
});

describe('POST /tasks', () => {
  it('201 creates task with minimal fields', async () => {
    const res = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${user.tokens.accessToken}`)
      .send({ title: 'My first task' });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('My first task');
    expect(res.body.data.status).toBe('OPEN');
    expect(res.body.data.priority).toBe('MEDIUM');
    expect(res.body.data.createdBy).toBeDefined();
  });

  it('201 creates task with all fields', async () => {
    const res = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${user.tokens.accessToken}`)
      .send({
        title: 'Full task',
        description: 'Some description',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.data.priority).toBe('HIGH');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });

  it('401 when unauthenticated', async () => {
    const res = await request(app).post(BASE).send({ title: 'Ghost task' });
    expect(res.status).toBe(401);
  });

  it('422 on missing title', async () => {
    const res = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${user.tokens.accessToken}`)
      .send({ description: 'No title here' });
    expect(res.status).toBe(422);
  });

  it('422 on invalid status enum', async () => {
    const res = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${user.tokens.accessToken}`)
      .send({ title: 'Bad status', status: 'BOGUS' });
    expect(res.status).toBe(422);
  });
});

describe('GET /tasks', () => {
  it('200 returns paginated task list', async () => {
    const res = await request(app)
      .get(BASE)
      .set('Authorization', `Bearer ${user.tokens.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.page).toBe(1);
  });

  it('200 filters by status', async () => {
    const res = await request(app)
      .get(`${BASE}?status=IN_PROGRESS`)
      .set('Authorization', `Bearer ${user.tokens.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.every((t: { status: string }) => t.status === 'IN_PROGRESS')).toBe(true);
  });

  it('200 search by title', async () => {
    const res = await request(app)
      .get(`${BASE}?search=Full`)
      .set('Authorization', `Bearer ${user.tokens.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('200 pagination with limit', async () => {
    const res = await request(app)
      .get(`${BASE}?page=1&limit=1`)
      .set('Authorization', `Bearer ${user.tokens.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.meta.limit).toBe(1);
  });

  it('401 when unauthenticated', async () => {
    const res = await request(app).get(BASE);
    expect(res.status).toBe(401);
  });
});

describe('GET /tasks/:id', () => {
  let taskId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${user.tokens.accessToken}`)
      .send({ title: 'Get-by-id task' });
    taskId = res.body.data.id as string;
  });

  it('200 returns task with relations', async () => {
    const res = await request(app)
      .get(`${BASE}/${taskId}`)
      .set('Authorization', `Bearer ${user.tokens.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(taskId);
    expect(res.body.data.createdBy).toBeDefined();
  });

  it('404 on non-existent id', async () => {
    const res = await request(app)
      .get(`${BASE}/clxxxxxxxxxxxxxxxxxxxxxx`)
      .set('Authorization', `Bearer ${user.tokens.accessToken}`);
    expect(res.status).toBe(404);
  });
});

describe('PATCH /tasks/:id', () => {
  let taskId: string;
  let otherUser: TestUser;

  beforeAll(async () => {
    const res = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${user.tokens.accessToken}`)
      .send({ title: 'Update target task' });
    taskId = res.body.data.id as string;

    otherUser = await registerAndLogin(app, { email: 'other-user@test.com' });
  });

  it('200 owner can update', async () => {
    const res = await request(app)
      .patch(`${BASE}/${taskId}`)
      .set('Authorization', `Bearer ${user.tokens.accessToken}`)
      .send({ title: 'Updated title', status: 'IN_PROGRESS' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated title');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });

  it('403 other regular user cannot update', async () => {
    const res = await request(app)
      .patch(`${BASE}/${taskId}`)
      .set('Authorization', `Bearer ${otherUser.tokens.accessToken}`)
      .send({ title: 'Hijacked title' });
    expect(res.status).toBe(403);
  });

  it('200 admin can update any task', async () => {
    const res = await request(app)
      .patch(`${BASE}/${taskId}`)
      .set('Authorization', `Bearer ${admin.tokens.accessToken}`)
      .send({ priority: 'CRITICAL' });

    expect(res.status).toBe(200);
    expect(res.body.data.priority).toBe('CRITICAL');
  });

  it('422 on empty update body', async () => {
    const res = await request(app)
      .patch(`${BASE}/${taskId}`)
      .set('Authorization', `Bearer ${user.tokens.accessToken}`)
      .send({});
    expect(res.status).toBe(422);
  });
});

describe('DELETE /tasks/:id', () => {
  let taskId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${user.tokens.accessToken}`)
      .send({ title: 'Task to delete' });
    taskId = res.body.data.id as string;
  });

  it('403 other user cannot delete', async () => {
    const other = await registerAndLogin(app, { email: 'delete-other@test.com' });
    const res = await request(app)
      .delete(`${BASE}/${taskId}`)
      .set('Authorization', `Bearer ${other.tokens.accessToken}`);
    expect(res.status).toBe(403);
  });

  it('204 owner can soft-delete', async () => {
    const res = await request(app)
      .delete(`${BASE}/${taskId}`)
      .set('Authorization', `Bearer ${user.tokens.accessToken}`);
    expect(res.status).toBe(204);
  });

  it('404 deleted task not returned by GET', async () => {
    const res = await request(app)
      .get(`${BASE}/${taskId}`)
      .set('Authorization', `Bearer ${user.tokens.accessToken}`);
    expect(res.status).toBe(404);
  });

  it('404 deleted task not in list', async () => {
    const res = await request(app)
      .get(BASE)
      .set('Authorization', `Bearer ${user.tokens.accessToken}`);
    const ids = (res.body.data as Array<{ id: string }>).map((t) => t.id);
    expect(ids).not.toContain(taskId);
  });
});

describe('GET /tasks/:id/activity', () => {
  let taskId: string;

  beforeAll(async () => {
    const createRes = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${user.tokens.accessToken}`)
      .send({ title: 'Activity task' });
    taskId = createRes.body.data.id as string;

    await request(app)
      .patch(`${BASE}/${taskId}`)
      .set('Authorization', `Bearer ${user.tokens.accessToken}`)
      .send({ status: 'IN_PROGRESS' });
  });

  it('200 returns activity log entries', async () => {
    const res = await request(app)
      .get(`${BASE}/${taskId}/activity`)
      .set('Authorization', `Bearer ${user.tokens.accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);

    const actions = (res.body.data as Array<{ action: string }>).map((a) => a.action);
    expect(actions).toContain('CREATED');
    expect(actions).toContain('STATUS_CHANGED');
  });

  it('404 on non-existent task', async () => {
    const res = await request(app)
      .get(`${BASE}/clxxxxxxxxxxxxxxxxxxxxxx/activity`)
      .set('Authorization', `Bearer ${user.tokens.accessToken}`);
    expect(res.status).toBe(404);
  });
});
