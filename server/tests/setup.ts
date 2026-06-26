import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import type { Application } from 'express';

export const prisma = new PrismaClient();

export async function cleanDatabase(): Promise<void> {
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tokens: AuthTokens;
}

export async function registerAndLogin(
  app: Application,
  overrides: {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  } = {},
): Promise<TestUser> {
  const payload = {
    email: overrides.email ?? `user_${Date.now()}@test.com`,
    password: overrides.password ?? 'Password123',
    firstName: overrides.firstName ?? 'Test',
    lastName: overrides.lastName ?? 'User',
  };

  const regRes = await request(app).post('/api/v1/auth/register').send(payload);

  if (regRes.status !== 201) {
    throw new Error(`Registration failed: ${JSON.stringify(regRes.body)}`);
  }

  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: payload.email, password: payload.password });

  if (loginRes.status !== 200) {
    throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
  }

  return {
    id: loginRes.body.data.user.id as string,
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    tokens: loginRes.body.data.tokens as AuthTokens,
  };
}

afterAll(async () => {
  await prisma.$disconnect();
});
