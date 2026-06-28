import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { User } from '@prisma/client';
import { env } from '../config/env.config';
import { db } from '../config/database';
import { UserRepository } from '../repositories/user.repository';
import type { AuthTokens, JwtPayload, SafeUser } from '../interfaces';
import type {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from '../validators/auth.validator';
import { ConflictError, UnauthorizedError, NotFoundError, BadRequestError } from '../utils/errors';

const userRepo = new UserRepository(db);

const SALT_ROUNDS = 12;

function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    avatarUrl: user.avatarUrl ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function generateTokens(payload: JwtPayload): AuthTokens {
  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
  return { accessToken, refreshToken };
}

export async function register(
  input: RegisterInput,
): Promise<{ user: SafeUser; tokens: AuthTokens }> {
  const existing = await userRepo.findByEmail(input.email);
  if (existing) {
    throw new ConflictError('An account with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await userRepo.create({
    email: input.email,
    password: hashedPassword,
    firstName: input.firstName,
    lastName: input.lastName,
  });

  const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
  const tokens = generateTokens(payload);
  await userRepo.updateRefreshToken(user.id, tokens.refreshToken);

  return { user: toSafeUser(user), tokens };
}

export async function login(input: LoginInput): Promise<{ user: SafeUser; tokens: AuthTokens }> {
  const user = await userRepo.findByEmail(input.email);
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const passwordMatch = await bcrypt.compare(input.password, user.password);
  if (!passwordMatch) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
  const tokens = generateTokens(payload);
  await userRepo.updateRefreshToken(user.id, tokens.refreshToken);

  return { user: toSafeUser(user), tokens };
}

export async function refreshTokens(token: string): Promise<AuthTokens> {
  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const user = await userRepo.findById(decoded.userId);
  if (!user || user.refreshToken !== token) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
  const tokens = generateTokens(payload);
  await userRepo.updateRefreshToken(user.id, tokens.refreshToken);

  return tokens;
}

export async function logout(userId: string): Promise<void> {
  await userRepo.updateRefreshToken(userId, null);
}

export async function getCurrentUser(userId: string): Promise<SafeUser> {
  const user = await userRepo.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return toSafeUser(user);
}

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<SafeUser> {
  const user = await userRepo.findById(userId);
  if (!user) throw new NotFoundError('User not found');

  const updated = await userRepo.update(userId, {
    ...(input.firstName !== undefined && { firstName: input.firstName }),
    ...(input.lastName !== undefined && { lastName: input.lastName }),
  });
  return toSafeUser(updated);
}

export async function updateAvatar(userId: string, avatarUrl: string): Promise<SafeUser> {
  const user = await userRepo.findById(userId);
  if (!user) throw new NotFoundError('User not found');

  const updated = await userRepo.update(userId, { avatarUrl });
  return toSafeUser(updated);
}

export async function changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
  const user = await userRepo.findById(userId);
  if (!user) throw new NotFoundError('User not found');

  const match = await bcrypt.compare(input.currentPassword, user.password);
  if (!match) throw new BadRequestError('Current password is incorrect');

  const hashed = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
  await userRepo.update(userId, { password: hashed });
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired access token');
  }
}
